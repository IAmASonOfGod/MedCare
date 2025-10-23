"use server";

import { ID, Query, Models } from "node-appwrite";
import { databases, DATABASE_ID, ADMIN_INVITES_COLLECTION_ID } from "@/lib/appwrite.config";
import crypto from "crypto";

interface SuperAdminInvite extends Models.Document {
  practiceId: string;
  practiceName: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  createdBy: string; // super-admin ID
  status: "pending" | "sent" | "used" | "expired";
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSuperAdminInvite(args: {
  practiceId: string;
  practiceName: string;
  email: string;
  createdBy: string;
  ttlHours?: number;
}) {
  const { practiceId, practiceName, email, createdBy, ttlHours = 72 } = args;
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();
  
  // TEMPORARY: Skip database operations for testing notifications
  console.log("🔧 TESTING MODE: Skipping database operations");
  console.log("📧 Would create invite for:", { practiceId, practiceName, email, createdBy });
  console.log("🔑 Generated token:", token);
  
  // TODO: Uncomment this when you're ready to use the database
  // await databases.createDocument(
  //   DATABASE_ID!,
  //   ADMIN_INVITES_COLLECTION_ID!,
  //   ID.unique(),
  //   {
  //     practiceId,
  //     practiceName,
  //     email,
  //     tokenHash,
  //     expiresAt,
  //     createdBy,
  //     status: "pending",
  //     createdAt: new Date().toISOString(),
  //   }
  // );
  
  return { token };
}

export async function validateSuperAdminInviteToken(
  token: string
): Promise<SuperAdminInvite | null> {
  const tokenHash = hashToken(token);
  const res = await databases.listDocuments(
    DATABASE_ID!,
    ADMIN_INVITES_COLLECTION_ID!,
    [
      Query.equal("tokenHash", [tokenHash]),
      Query.limit(1),
    ]
  );
  const invite = res.documents[0] as SuperAdminInvite;
  if (!invite || invite.status !== "pending") return null;
  const now = new Date();
  const expiresAt = new Date(invite.expiresAt);
  if (now > expiresAt) {
    // Mark as expired
    await databases.updateDocument(
      DATABASE_ID,
      ADMIN_INVITES_COLLECTION_ID,
      invite.$id,
      { status: "expired" }
    );
    return null;
  }
  return invite;
}

export async function markSuperAdminInviteUsed(inviteId: string, usedBy: string) {
  await databases.updateDocument(
    DATABASE_ID!,
    ADMIN_INVITES_COLLECTION_ID!,
    inviteId,
    {
      status: "used",
      usedAt: new Date().toISOString(),
      usedBy,
    }
  );
}

export async function getSuperAdminInvites(): Promise<SuperAdminInvite[]> {
  // TEMPORARY: Return empty array for testing notifications
  console.log("🔧 TESTING MODE: Returning empty invites array");
  
  // TODO: Uncomment this when you're ready to use the database
  // const res = await databases.listDocuments(
  //   DATABASE_ID!,
  //   ADMIN_INVITES_COLLECTION_ID!,
  //   [Query.orderDesc("createdAt")]
  // );
  // return res.documents as SuperAdminInvite[];
  
  return [];
}
