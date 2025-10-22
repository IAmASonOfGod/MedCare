import { NextResponse } from "next/server";
import { fetchAllPractices, fetchPendingPractices } from "@/lib/actions/practice.actions";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(req: Request) {
  try {
    // For now, we'll allow any admin to view practices
    // In the future, you might want to restrict this to super admins
    await requireAdmin();
    
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
