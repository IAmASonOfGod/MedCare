import { NextResponse } from "next/server";
import {
  createAdminAccount,
  markInviteUsed,
  validateInviteToken,
} from "@/lib/actions/admin.actions";
import {
  validateSuperAdminInviteToken,
  markSuperAdminInviteUsed,
} from "@/lib/actions/superAdmin.actions";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { token, password, recoveryEmail } = await req.json();
    if (!token || !password || !recoveryEmail)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Try to validate as super-admin invite first
    let invite = await validateSuperAdminInviteToken(token);
    let isSuperAdminInvite = true;

    if (!invite) {
      // Fallback to regular admin invite
      invite = await validateInviteToken(token);
      isSuperAdminInvite = false;
    }

    if (!invite)
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 400 }
      );

    const admin = await createAdminAccount({
      email: invite.email,
      password,
      recoveryEmail,
      practiceId: invite.practiceId,
    });

    // Mark the appropriate invite as used
    if (isSuperAdminInvite) {
      await markSuperAdminInviteUsed(invite.$id, admin.$id);
    } else {
      await markInviteUsed(invite.$id, admin.$id);
    }

    const jwt = await signToken(
      { adminId: admin.$id, practiceId: invite.practiceId, role: "admin" },
      60 * 60 * 8
    );
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", jwt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
