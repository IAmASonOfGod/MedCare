import { NextResponse } from "next/server";
import { createAdminInvite } from "@/lib/actions/admin.actions";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { sendSms } from "@/lib/notifications/sms";
import { sendInviteEmail } from "@/lib/notifications/email-service";

export async function POST(req: Request) {
  // Admin invites are disabled - only super-admin can create invites
  return NextResponse.json(
    { 
      error: "Admin invites are disabled. Only super-admin can create practice invites.",
      code: "ADMIN_INVITES_DISABLED"
    }, 
    { status: 403 }
  );
}
