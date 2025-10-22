import { AdminClaims } from "./jwt";

export function isAdmin(claims: AdminClaims) {
  return claims?.role === "admin";
}

export function assertPracticeScope(claims: AdminClaims, practiceId: string) {
  if (!claims?.practiceId || claims.practiceId !== practiceId) {
    throw new Error("Forbidden");
  }
}




