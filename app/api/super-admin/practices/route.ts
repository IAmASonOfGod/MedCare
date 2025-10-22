import { NextResponse } from "next/server";
import { fetchAllPractices, fetchPendingPractices } from "@/lib/actions/practice.actions";
import { requireSuperAdmin } from "@/lib/auth/requireSuperAdmin";

export async function GET(req: Request) {
  try {
    // Only super admins can access this
    await requireSuperAdmin();
    
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    
    let practices;
    if (status === "pending") {
      practices = await fetchPendingPractices();
    } else {
      practices = await fetchAllPractices();
    }
    
    return NextResponse.json({ practices });
  } catch (error: any) {
    console.error("Error fetching practices:", error);
    return NextResponse.json(
      { error: "Failed to fetch practices" },
      { status: 500 }
    );
  }
}
