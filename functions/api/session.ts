import {
  getSessionFromRequest,
  requireSecret,
  clearSessionCookie,
} from "../../lib/auth/session";

type Env = {
  AUTH_SECRET?: string;
};

export const onRequestGet = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  try {
    const secret = requireSecret(env.AUTH_SECRET);
    const session = await getSessionFromRequest(request, secret);
    if (!session) {
      return unauthorizedResponse();
    }
    return jsonResponse({ email: session.email }, 200);
  } catch (error) {
    console.error("Session lookup error", error);
    return jsonResponse({ error: "Auth misconfiguration" }, 500);
  }
};

export const onRequestDelete = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  try {
    requireSecret(env.AUTH_SECRET);
    const secure = new URL(request.url).protocol === "https:";
    const headers = new Headers({
      "Set-Cookie": clearSessionCookie(secure),
    });
    return new Response(null, { status: 204, headers });
  } catch (error) {
    console.error("Session revoke error", error);
    return jsonResponse({ error: "Auth misconfiguration" }, 500);
  }
};

const unauthorizedResponse = (): Response =>
  jsonResponse({ error: "Unauthorized" }, 401);

const jsonResponse = (
  payload: Record<string, unknown> | null,
  status: number
): Response =>
  new Response(payload ? JSON.stringify(payload) : null, {
    status,
    headers: { "Content-Type": "application/json" },
  });
