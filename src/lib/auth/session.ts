import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { connection } from "next/server";

export type SessionData = { userId?: number };

export const SESSION_COOKIE = "thl_admin";

function options(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return {
    password,
    cookieName: SESSION_COOKIE,
    ttl: 60 * 60 * 24 * 7,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
}

export async function getSession() {
  /* iron-session reads Date.now() to check the seal's expiry; connection()
     marks this as request-time work so prerendering never sees that call. */
  await connection();
  return getIronSession<SessionData>(await cookies(), options());
}
