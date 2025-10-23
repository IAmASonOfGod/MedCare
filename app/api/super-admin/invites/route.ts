import { NextResponse } from "next/server";
import { createSuperAdminInvite } from "@/lib/actions/superAdmin.actions";
import { requireSuperAdmin } from "@/lib/auth/requireSuperAdmin";
import { sendAdminInvite } from "@/lib/notifications/notificationapi";

export async function POST(req: Request) {
  try {
    const claims = await requireSuperAdmin();
    const { practiceId, practiceName, email, phone, ttlHours } = await req.json();
    
    if (!practiceId || !practiceName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { token } = await createSuperAdminInvite({
      practiceId,
      practiceName,
      email,
      createdBy: claims.superAdminId,
      ttlHours,
    });

    const inviteUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/admin/signup?token=${token}`;

    try {
      await sendAdminInvite({
        email,
        phone: phone || undefined, // Pass phone if provided
        inviteUrl,
        practiceName,
      });
      console.log("✅ Admin invite sent successfully via NotificationAPI");
    } catch (error) {
      console.error("Failed to send invite via NotificationAPI:", error);
      // Continue anyway - the invite was created
    }

    return NextResponse.json({ 
      success: true, 
      inviteUrl,
      message: "Admin invite sent successfully"
    });
  } catch (e: any) {
    console.error("Super admin invite error:", e);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
