import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { email, password, practiceId, adminId } = await req.json();
    // TODO: Replace with real authentication/lookup
    if (!email || !password || !practiceId || !adminId)
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );

    const token = await signToken(
      { adminId, practiceId, role: "admin" },
      60 * 60 * 8
    );

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
