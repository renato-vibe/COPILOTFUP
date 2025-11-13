type CreateSessionRequestBody = {
  workflow?: { id?: string | null } | null;
  scope?: { user_id?: string | null } | null;
  workflowId?: string | null;
  chatkit_configuration?: {
    file_upload?: {
      enabled?: boolean;
    };
  };
};

type Env = {
  OPENAI_API_KEY?: string;
  NEXT_PUBLIC_CHATKIT_WORKFLOW_ID?: string;
  CHATKIT_API_BASE?: string;
};

const DEFAULT_CHATKIT_BASE = "https://api.openai.com";
const DEFAULT_WORKFLOW_ID =
  "wf_691498ab3cd08190b31a1ecadd223ed008ae1288861d6473";
const SESSION_COOKIE_NAME = "chatkit_session_id";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const onRequestPost = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  if (request.method !== "POST") {
    return methodNotAllowedResponse();
  }

  let sessionCookie: string | null = null;

  try {
    const openaiApiKey = env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return buildJsonResponse(
        { error: "Missing OPENAI_API_KEY environment variable" },
        500,
        { "Content-Type": "application/json" },
        sessionCookie
      );
    }

    const parsedBody = await safeParseJson<CreateSessionRequestBody>(request);
    const { userId, sessionCookie: resolvedCookie } = await resolveUserId(request);
    sessionCookie = resolvedCookie;

    const resolvedWorkflowId =
      parsedBody?.workflow?.id ??
      parsedBody?.workflowId ??
      env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID ??
      DEFAULT_WORKFLOW_ID;

    if (!resolvedWorkflowId) {
      return buildJsonResponse(
        { error: "Missing workflow id" },
        400,
        { "Content-Type": "application/json" },
        sessionCookie
      );
    }

    const apiBase = env.CHATKIT_API_BASE ?? DEFAULT_CHATKIT_BASE;
    const url = `${apiBase}/v1/chatkit/sessions`;

    const upstreamResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "chatkit_beta=v1",
      },
      body: JSON.stringify({
        workflow: { id: resolvedWorkflowId },
        user: userId,
        chatkit_configuration: {
          file_upload: {
            enabled: parsedBody?.chatkit_configuration?.file_upload?.enabled ?? false,
          },
        },
      }),
    });

    const upstreamJson = (await upstreamResponse
      .json()
      .catch(() => ({}))) as Record<string, unknown> | undefined;

    if (!upstreamResponse.ok) {
      const upstreamError = extractUpstreamError(upstreamJson);
      return buildJsonResponse(
        {
          error:
            upstreamError ??
            `Failed to create session: ${upstreamResponse.statusText}`,
          details: upstreamJson,
        },
        upstreamResponse.status,
        { "Content-Type": "application/json" },
        sessionCookie
      );
    }

    const clientSecret = upstreamJson?.client_secret ?? null;
    const expiresAfter = upstreamJson?.expires_after ?? null;

    return buildJsonResponse(
      { client_secret: clientSecret, expires_after: expiresAfter },
      200,
      { "Content-Type": "application/json" },
      sessionCookie
    );
  } catch (error) {
    console.error("Create session error (CF)", error);
    return buildJsonResponse(
      { error: "Unexpected error" },
      500,
      { "Content-Type": "application/json" },
      sessionCookie
    );
  }
};

const methodNotAllowedResponse = (): Response =>
  new Response(JSON.stringify({ error: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });

const resolveUserId = async (request: Request): Promise<{
  userId: string;
  sessionCookie: string | null;
}> => {
  const existing = getCookieValue(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  if (existing) {
    return { userId: existing, sessionCookie: null };
  }

  const generated =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const shouldUseSecure = new URL(request.url).protocol === "https:";
  return {
    userId: generated,
    sessionCookie: serializeSessionCookie(generated, shouldUseSecure),
  };
};

const getCookieValue = (cookieHeader: string | null, name: string): string | null => {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rest] = cookie.split("=");
    if (!rawName || rest.length === 0) {
      continue;
    }
    if (rawName.trim() === name) {
      return rest.join("=").trim();
    }
  }
  return null;
};

const serializeSessionCookie = (value: string, secure: boolean): string => {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${SESSION_COOKIE_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (secure) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
};

const buildJsonResponse = (
  payload: unknown,
  status: number,
  headers: Record<string, string>,
  sessionCookie: string | null
): Response => {
  const responseHeaders = new Headers(headers);
  if (sessionCookie) {
    responseHeaders.append("Set-Cookie", sessionCookie);
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  });
};

const safeParseJson = async <T>(req: Request): Promise<T | null> => {
  try {
    const text = await req.text();
    if (!text) {
      return null;
    }
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const extractUpstreamError = (
  payload: Record<string, unknown> | undefined
): string | null => {
  if (!payload) {
    return null;
  }

  const error = payload.error;
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  const details = payload.details;
  if (typeof details === "string") {
    return details;
  }

  if (details && typeof details === "object" && "error" in details) {
    const nestedError = (details as { error?: unknown }).error;
    if (typeof nestedError === "string") {
      return nestedError;
    }
    if (
      nestedError &&
      typeof nestedError === "object" &&
      "message" in nestedError &&
      typeof (nestedError as { message?: unknown }).message === "string"
    ) {
      return (nestedError as { message: string }).message;
    }
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return null;
};
