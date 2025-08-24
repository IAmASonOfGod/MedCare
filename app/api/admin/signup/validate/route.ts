import { NextResponse } from "next/server";
import { validateInviteToken } from "@/lib/actions/admin.actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";
  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const invite = await validateInviteToken(token);
  if (!invite)
    return NextResponse.json({ error: "Invalid or expired" }, { status: 400 });
  return NextResponse.json({
    email: invite.email,
    practiceId: invite.practiceId,
    inviteId: invite.$id,
  });
}
