import { NextResponse } from "next/server";
import { authenticateSuperAdmin } from "@/lib/auth/requireSuperAdmin";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate super admin
    const isValid = await authenticateSuperAdmin(email, password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid super admin credentials" },
        { status: 401 }
      );
    }

    // Create JWT token for super admin
    const jwt = await signToken(
      { 
        superAdminId: "super_admin_1", 
        email, 
        role: "super_admin" 
      },
      60 * 60 * 8 // 8 hours
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set("super_admin_token", jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (error: any) {
    console.error("Super admin login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
