import { NextResponse } from "next/server";
import { updatePracticeVerificationStatus, getPracticeById } from "@/lib/actions/practice.actions";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminInvite } from "@/lib/actions/admin.actions";
import { sendInviteEmail } from "@/lib/notifications/email-service";

export async function POST(
  req: Request,
  { params }: { params: { practiceId: string } }
) {
  try {
    const claims = await requireAdmin();
    const { status } = await req.json();
    
    if (!["pending", "verified", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid verification status" },
        { status: 400 }
      );
    }
    
    // Update the practice verification status
    await updatePracticeVerificationStatus(
      params.practiceId,
      status as "pending" | "verified" | "rejected",
      claims.adminId
    );
    
    // If verified, create and send admin invite
    if (status === "verified") {
      const practice = await getPracticeById(params.practiceId);
      if (practice && (practice as any).contactEmail) {
        try {
          // Create admin invite
          const { token } = await createAdminInvite({
            practiceId: params.practiceId,
            email: (practice as any).contactEmail,
            createdBy: claims.adminId,
            ttlHours: 72, // 3 days
          });
          
          // Generate invite URL
          const inviteUrl = `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/admin/signup?token=${token}`;
          
          // Send invite email
          await sendInviteEmail((practice as any).contactEmail, inviteUrl);
          
          return NextResponse.json({ 
            success: true, 
            message: "Practice verified and admin invite sent",
            inviteUrl 
          });
        } catch (emailError) {
          console.error("Error sending admin invite:", emailError);
          return NextResponse.json(
            { 
              success: true, 
              message: "Practice verified but failed to send admin invite",
              error: "Email sending failed"
            },
            { status: 200 }
          );
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Practice ${status} successfully` 
    });
  } catch (error: any) {
    console.error("Error updating practice verification:", error);
    return NextResponse.json(
      { error: "Failed to update practice verification" },
      { status: 500 }
    );
  }
}
