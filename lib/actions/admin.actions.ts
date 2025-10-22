"use server";

import { ID, InputFile, Query, Models } from "node-appwrite";
import { databases } from "@/lib/appwrite.config";
import crypto from "crypto";
import argon2 from "argon2";

// Define interfaces for admin-related documents
interface AdminInvite extends Models.Document {
  practiceId: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
}

interface Admin extends Models.Document {
  email: string;
  passwordHash: string;
  recoveryEmail: string;
  practiceId: string;
  role: string;
  createdAt: string;
}

const DATABASE_ID = process.env.DATABASE_ID as string;
const ADMINS_COLLECTION_ID = process.env.ADMINS_COLLECTION_ID as string;
const ADMIN_INVITES_COLLECTION_ID = process.env.ADMIN_INVITES_COLLECTION_ID as string;
const ADMIN_PASSWORD_RESETS_COLLECTION_ID = process.env.ADMIN_PASSWORD_RESETS_COLLECTION_ID as string;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createAdminInvite(args: {
  practiceId: string;
  email: string;
  createdBy: string;
  ttlHours?: number;
}) {
  const { practiceId, email, createdBy, ttlHours = 72 } = args;
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();
  await databases.createDocument(
    DATABASE_ID,
    ADMIN_INVITES_COLLECTION_ID,
    ID.unique(),
    {
      practiceId,
      email,
      tokenHash,
      expiresAt,
      createdBy,
      createdAt: new Date().toISOString(),
    }
  );
  return { token };
}

export async function validateInviteToken(
  token: string
): Promise<AdminInvite | null> {
  const tokenHash = hashToken(token);
  const res = await databases.listDocuments(
    DATABASE_ID,
    ADMIN_INVITES_COLLECTION_ID,
    [Query.equal("tokenHash", [tokenHash]), Query.isNull("usedAt")]
  );
  const doc = res.documents[0] as AdminInvite;
  if (!doc) return null;
  if (new Date(doc.expiresAt).getTime() < Date.now()) return null;
  return doc;
}

export async function markInviteUsed(inviteId: string, usedBy: string) {
  await databases.updateDocument(
    DATABASE_ID,
    ADMIN_INVITES_COLLECTION_ID,
    inviteId,
    {
      usedAt: new Date().toISOString(),
      usedBy,
    }
  );
}

export async function createAdminAccount(args: {
  email: string;
  password: string;
  recoveryEmail: string;
  practiceId: string;
}): Promise<Admin> {
  const passwordHash = await argon2.hash(args.password, {
    type: argon2.argon2id,
  });
  const admin = (await databases.createDocument(
    DATABASE_ID,
    ADMINS_COLLECTION_ID,
    ID.unique(),
    {
      email: args.email,
      passwordHash,
      recoveryEmail: args.recoveryEmail,
      practiceId: args.practiceId,
      role: "admin",
      createdAt: new Date().toISOString(),
    }
  )) as Admin;
  return admin;
}

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  const res = await databases.listDocuments(DATABASE_ID, ADMINS_COLLECTION_ID, [
    Query.equal("email", [email]),
    Query.limit(1),
  ]);
  return (res.documents[0] as Admin) || null;
}

// Password reset tokens
export async function createPasswordResetToken(args: {
  email: string;
  ttlMinutes?: number;
}) {
  const { email, ttlMinutes = 30 } = args;
  const admin = await findAdminByEmail(email);
  if (!admin) return null;
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  const doc = await databases.createDocument(
    DATABASE_ID,
    ADMIN_PASSWORD_RESETS_COLLECTION_ID,
    ID.unique(),
    {
      adminId: admin.$id,
      email: admin.email,
      tokenHash,
      expiresAt,
      createdAt: new Date().toISOString(),
      usedAt: null,
    }
  );
  return { token, resetId: doc.$id, admin };
}

export async function validatePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const res = await databases.listDocuments(
    DATABASE_ID,
    ADMIN_PASSWORD_RESETS_COLLECTION_ID,
    [Query.equal("tokenHash", [tokenHash]), Query.isNull("usedAt")]
  );
  const doc = res.documents[0] as any;
  if (!doc) return null;
  if (new Date(doc.expiresAt).getTime() < Date.now()) return null;
  return doc;
}

export async function markPasswordResetUsed(resetId: string) {
  await databases.updateDocument(
    DATABASE_ID,
    ADMIN_PASSWORD_RESETS_COLLECTION_ID,
    resetId,
    { usedAt: new Date().toISOString() }
  );
}

export async function updateAdminPassword(adminId: string, newPassword: string) {
  const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await databases.updateDocument(DATABASE_ID, ADMINS_COLLECTION_ID, adminId, {
    passwordHash,
  });
}

export async function verifyAdminPassword(
  admin: Admin,
  password: string
): Promise<boolean> {
  return argon2.verify(admin.passwordHash, password);
}
