/**
 * Auth helpers: session cookie (signed with jose) and password verification.
 * Users are stored in the same DB; only developer can add/edit via database or seed.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "ledgerpro_session";
// Session cookie: no maxAge = browser session only (user must login again when they open the app)
const SESSION_MAX_AGE = 0; // 0 = session cookie (no persistent expiry)

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set and at least 16 characters (e.g. in .env or .env.local)");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = { username: string; exp: number };

export async function createSession(username: string): Promise<string> {
  const secret = getSecret();
  const exp = SESSION_MAX_AGE > 0
    ? Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
    : Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h for JWT exp claim only; cookie is session
  const token = await new SignJWT({ username, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .sign(secret);
  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    if (!payload.username || typeof payload.username !== "string") return null;
    return { username: payload.username, exp: Number(payload.exp) || 0 };
  } catch {
    return null;
  }
}

export function getCookieName() {
  return COOKIE_NAME;
}

/** 0 = session cookie (expires when browser closes); else maxAge in seconds */
export function getCookieMaxAge() {
  return SESSION_MAX_AGE;
}
