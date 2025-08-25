import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { email, password, practiceId, adminId } = await req.json();

    // Validate required fields
    if (!email || !password || !practiceId || !adminId) {
      console.error("Missing credentials in login request:", {
        email: !!email,
        password: !!password,
        practiceId: !!practiceId,
        adminId: !!adminId,
      });
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("Attempting to sign token for admin:", adminId);
    const token = await signToken(
      { adminId, practiceId, role: "admin" },
      60 * 60 * 8
    );
    console.log("Token signed successfully");

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e: any) {
    console.error("Login API error:", e);
    return NextResponse.json(
      {
        error: "Login failed",
        details: process.env.NODE_ENV === "development" ? e.message : undefined,
      },
      { status: 500 }
    );
  }
}
