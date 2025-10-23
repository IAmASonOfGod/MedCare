import { NextResponse } from "next/server";

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
