import { NextResponse } from "next/server";
import { validatePasswordResetToken } from "@/lib/actions/admin.actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") || "";
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const doc = await validatePasswordResetToken(token);
  if (!doc) return NextResponse.json({ error: "Invalid or expired" }, { status: 400 });
  return NextResponse.json({ ok: true, email: doc.email });
}




