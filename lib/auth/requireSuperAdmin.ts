import { cookies } from "next/headers";
import { verifyToken, SuperAdminClaims } from "./jwt";

export interface SuperAdminClaims {
  superAdminId: string;
  email: string;
  role: "super_admin";
}

export async function requireSuperAdmin(): Promise<SuperAdminClaims> {
  const cookieStore = cookies();
  const token = cookieStore.get("super_admin_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const claims = await verifyToken(token);
  if (!claims?.superAdminId || claims?.role !== "super_admin") throw new Error("Unauthorized");
  return claims;
}

export async function authenticateSuperAdmin(email: string, password: string): Promise<boolean> {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  
  return email === superAdminEmail && password === superAdminPassword;
}
