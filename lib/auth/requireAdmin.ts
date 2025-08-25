import { cookies } from "next/headers";
import { verifyToken, AdminClaims } from "./jwt";

export async function requireAdmin(): Promise<AdminClaims> {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const claims = await verifyToken(token);
  if (!claims?.adminId || !claims?.practiceId) throw new Error("Unauthorized");
  return claims;
}
