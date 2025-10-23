import { NextResponse } from "next/server";
import { validateInviteToken } from "@/lib/actions/admin.actions";
import { validateSuperAdminInviteToken } from "@/lib/actions/superAdmin.actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";
  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 400 });

  // Try to validate as super-admin invite first
  let invite = await validateSuperAdminInviteToken(token);
  let isSuperAdminInvite = true;

  if (!invite) {
    // Fallback to regular admin invite
    invite = await validateInviteToken(token);
    isSuperAdminInvite = false;
  }

  if (!invite)
    return NextResponse.json({ error: "Invalid or expired" }, { status: 400 });

  return NextResponse.json({
    email: invite.email,
    practiceId: invite.practiceId,
    practiceName: invite.practiceName || "Unknown Practice",
    inviteId: invite.$id,
    isSuperAdminInvite,
  });
}
