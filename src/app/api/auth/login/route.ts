import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSession, getCookieName, getCookieMaxAge } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await createSession(user.username);
    const res = NextResponse.json({ ok: true });
    const maxAge = getCookieMaxAge();
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(maxAge > 0 ? { maxAge } : {}), // no maxAge = session cookie (login every time user opens app)
    });
    return res;
  } catch (e) {
    console.error("POST /api/auth/login", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
