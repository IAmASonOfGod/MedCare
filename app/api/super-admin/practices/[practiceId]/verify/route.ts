import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/requireSuperAdmin";
import { databases, DATABASE_ID, PRACTICES_COLLECTION_ID } from "@/lib/appwrite.config";

export async function POST(
  req: Request,
  { params }: { params: { practiceId: string } }
) {
  try {
    // Verify super-admin authentication
    await requireSuperAdmin();
    
    const { practiceId } = params;
    
    if (!practiceId) {
      return NextResponse.json({ error: "Practice ID required" }, { status: 400 });
    }

    // Update practice verification status
    await databases.updateDocument(
      DATABASE_ID!,
      PRACTICES_COLLECTION_ID!,
      practiceId,
      { isVerified: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Practice verified successfully" 
    });
  } catch (e: any) {
    console.error("Practice verification error:", e);
    return NextResponse.json(
      { error: "Failed to verify practice" },
      { status: 500 }
    );
  }
}
