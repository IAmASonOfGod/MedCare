import { cookies } from "next/headers";
import { verifyToken, SuperAdminClaims } from "./jwt";

export async function requireSuperAdmin(): Promise<SuperAdminClaims> {
  const cookieStore = cookies();
  const token = cookieStore.get("super_admin_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const claims = await verifyToken(token);
  if (!claims?.superAdminId || claims?.role !== "super-admin") throw new Error("Unauthorized");
  return claims;
}
