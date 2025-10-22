import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/actions/admin.actions";
import { sendPasswordResetEmail } from "@/lib/notifications/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const res = await createPasswordResetToken({ email });
    // Always return ok to avoid user enumeration
    if (res?.token && res.admin) {
      const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const resetUrl = `${base}/admin/reset-password?token=${encodeURIComponent(res.token)}`;
      try {
        await sendPasswordResetEmail({ to: res.admin.email, resetUrl });
      } catch (_) {}
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}




