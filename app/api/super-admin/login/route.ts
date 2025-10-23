import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
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

    // TODO: Add proper super-admin authentication
    // For now, using hardcoded credentials (you should replace this)
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "superadmin@medcare.com";
    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin123!";

    if (email !== SUPER_ADMIN_EMAIL || password !== SUPER_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Super admin login successful");
    const token = await signToken(
      { superAdminId: "super-admin-1", role: "super-admin" },
      60 * 60 * 8 // 8 hours
    );

    const res = NextResponse.json({ ok: true });
    res.cookies.set("super_admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e: any) {
    console.error("Super admin login error:", e);
    return NextResponse.json(
      {
        error: "Login failed",
        details: process.env.NODE_ENV === "development" ? e.message : undefined,
      },
      { status: 500 }
    );
  }
}
