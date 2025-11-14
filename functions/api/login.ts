import bcrypt from "bcryptjs";
import { findUserByEmail } from "../../lib/auth/users";
import {
  createSessionToken,
  serializeSessionCookie,
  requireSecret,
} from "../../lib/auth/session";

type Env = {
  AUTH_SECRET?: string;
};

export const onRequestPost = async ({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await readBody(request);
  if (!body?.email || !body?.password) {
    return buildResponse({ error: "Email and password are required" }, 400);
  }

  const user = findUserByEmail(body.email);
  if (!user) {
    await delay();
    return buildResponse({ error: "Invalid credentials" }, 401);
  }

  const passwordOk = bcrypt.compareSync(body.password, user.hash);
  if (!passwordOk) {
    await delay();
    return buildResponse({ error: "Invalid credentials" }, 401);
  }

  try {
    const secret = requireSecret(env.AUTH_SECRET);
    const token = await createSessionToken(user.email, secret);
    const secure = new URL(request.url).protocol === "https:";
    const cookie = serializeSessionCookie(token, secure);
    return buildResponse({ email: user.email }, 200, cookie);
  } catch (error) {
    console.error("Login error", error);
    return buildResponse({ error: "Auth misconfiguration" }, 500);
  }
};

type LoginBody = {
  email?: string;
  password?: string;
};

const readBody = async (request: Request): Promise<LoginBody | null> => {
  try {
    return (await request.json()) as LoginBody;
  } catch {
    return null;
  }
};

const buildResponse = (
  payload: Record<string, unknown>,
  status: number,
  cookie?: string
): Response => {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (cookie) {
    headers.append("Set-Cookie", cookie);
  }
  return new Response(JSON.stringify(payload), { status, headers });
};

const delay = (ms = 200): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
