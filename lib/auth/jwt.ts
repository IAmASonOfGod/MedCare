import { jwtVerify, SignJWT } from "jose";

const encoder = new TextEncoder();

export interface AdminClaims {
  adminId: string;
  practiceId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface SuperAdminClaims {
  superAdminId: string;
  role: "super-admin";
  iat?: number;
  exp?: number;
}

export async function verifyToken(token: string): Promise<AdminClaims> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is not set");
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  return payload as unknown as AdminClaims;
}

export async function signToken(
  claims: Omit<AdminClaims, "iat" | "exp">,
  expiresInSeconds: number = 60 * 60
): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is not set");
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(encoder.encode(secret));
}


