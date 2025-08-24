import { NextResponse } from "next/server";
import { createAdminInvite } from "@/lib/actions/admin.actions";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { sendSms } from "@/lib/notifications/sms";
import { sendInviteEmail } from "@/lib/notifications/email";

export async function POST(req: Request) {
  try {
    const claims = await requireAdmin();
    const { email, ttlHours, phone } = await req.json();
    if (!email)
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    const { token } = await createAdminInvite({
      practiceId: claims.practiceId,
      email,
      createdBy: claims.adminId,
      ttlHours,
    });
    const inviteUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/admin/signup?token=${token}`;

    try {
      if (phone)
        await sendSms(phone, `Your MedCare admin invite: ${inviteUrl}`);
      await sendInviteEmail(email, inviteUrl);
    } catch (_) {}

    return NextResponse.json({ inviteUrl });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
