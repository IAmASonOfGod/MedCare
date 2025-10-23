import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/requireSuperAdmin";
import { getSuperAdminInvites } from "@/lib/actions/superAdmin.actions";
import { databases, DATABASE_ID, PRACTICES_COLLECTION_ID } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";

export async function GET() {
  try {
    // Verify super-admin authentication
    await requireSuperAdmin();
    
    // Get all practices
    const practicesRes = await databases.listDocuments(
      DATABASE_ID!,
      PRACTICES_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );
    
    // Get all super-admin invites
    const invites = await getSuperAdminInvites();
    
    return NextResponse.json({
      practices: practicesRes.documents,
      invites: invites,
    });
  } catch (e: any) {
    console.error("Super admin dashboard data error:", e);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
