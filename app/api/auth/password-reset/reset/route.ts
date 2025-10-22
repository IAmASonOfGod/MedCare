import { NextResponse } from "next/server";
import { markPasswordResetUsed, updateAdminPassword, validatePasswordResetToken } from "@/lib/actions/admin.actions";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const doc = await validatePasswordResetToken(token);
    if (!doc) return NextResponse.json({ error: "Invalid or expired" }, { status: 400 });
    await updateAdminPassword(doc.adminId, password);
    await markPasswordResetUsed(doc.$id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}




