const SESSION_COOKIE_NAME = "fup_auth";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type SessionPayload = {
  email: string;
  exp: number;
};

let cachedKey: CryptoKey | null = null;
let cachedSecret: string | null = null;

const base64Encode = (data: Uint8Array): string => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data).toString("base64");
  }

  let binary = "";
  data.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64Decode = (value: string): Uint8Array => {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const base64UrlEncode = (data: Uint8Array): string =>
  base64Encode(data).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const base64UrlDecode = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = normalized.length % 4;
  const padded =
    padLength === 0 ? normalized : `${normalized}${"=".repeat(4 - padLength)}`;
  return base64Decode(padded);
};

const bufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  bytes.forEach((byte) => {
    hex += byte.toString(16).padStart(2, "0");
  });
  return hex;
};

const timingSafeEquals = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

const getKey = async (secret: string): Promise<CryptoKey> => {
  if (cachedKey && cachedSecret === secret) {
    return cachedKey;
  }

  const imported = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  cachedKey = imported;
  cachedSecret = secret;
  return imported;
};

const sign = async (payloadBytes: Uint8Array, secret: string): Promise<string> => {
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    payloadBytes.buffer as ArrayBuffer
  );
  return bufferToHex(signature);
};

export const createSessionToken = async (
  email: string,
  secret: string
): Promise<string> => {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const encodedPayload = base64UrlEncode(payloadBytes);
  const signature = await sign(payloadBytes, secret);
  return `${encodedPayload}.${signature}`;
};

const parseCookieHeader = (cookieHeader: string | null): Record<string, string> => {
  const jar: Record<string, string> = {};
  if (!cookieHeader) {
    return jar;
  }
  const pairs = cookieHeader.split(";").map((item) => item.trim());
  for (const pair of pairs) {
    const [name, ...rest] = pair.split("=");
    if (!name || rest.length === 0) {
      continue;
    }
    jar[name] = rest.join("=");
  }
  return jar;
};

export const verifySessionToken = async (
  token: string,
  secret: string
): Promise<SessionPayload | null> => {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  try {
    const payloadBytes = base64UrlDecode(encodedPayload);
    const expectedSignature = await sign(payloadBytes, secret);
    if (!timingSafeEquals(expectedSignature, signature)) {
      return null;
    }

    const payload = JSON.parse(decoder.decode(payloadBytes)) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

export const getSessionFromRequest = async (
  request: Request,
  secret: string
): Promise<SessionPayload | null> => {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return null;
  }
  return verifySessionToken(token, secret);
};

export const serializeSessionCookie = (
  token: string,
  secure: boolean
): string => {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) {
    attributes.push("Secure");
  }
  return attributes.join("; ");
};

export const clearSessionCookie = (secure: boolean): string => {
  const attributes = [
    `${SESSION_COOKIE_NAME}=deleted`,
    "Path=/",
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) {
    attributes.push("Secure");
  }
  return attributes.join("; ");
};

export const requireSecret = (secret: string | undefined): string => {
  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable");
  }
  return secret;
};
