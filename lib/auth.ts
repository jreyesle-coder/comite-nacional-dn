import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cnd_auth";

function expectedToken() {
  const password = process.env.APP_PASSWORD ?? "";
  const secret = process.env.AUTH_SECRET ?? "";
  return createHash("sha256").update(`${password}:${secret}`).digest("hex");
}

export async function isAuthed() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return !!token && token === expectedToken();
}

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function checkPassword(password: string) {
  return password === (process.env.APP_PASSWORD ?? "");
}
