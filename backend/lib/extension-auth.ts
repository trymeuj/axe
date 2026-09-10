import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  entitlements,
  extensionConnections,
  extensionSessions,
  users,
} from "@/db/schema";

const CONNECTION_LIFETIME_MS = 10 * 60 * 1000;
const EXTENSION_SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function secretsMatch(value: string, expectedHash: string) {
  const actual = Buffer.from(hashSecret(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function randomSecret(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export async function createExtensionConnection(appOrigin: string) {
  const id = crypto.randomUUID();
  const userCode = randomSecret(18);
  const pollSecret = randomSecret();
  const expiresAt = new Date(Date.now() + CONNECTION_LIFETIME_MS);

  await db.insert(extensionConnections).values({
    id,
    userCodeHash: hashSecret(userCode),
    pollSecretHash: hashSecret(pollSecret),
    expiresAt,
  });

  const connectUrl = new URL("/connect-extension", appOrigin);
  connectUrl.searchParams.set("code", userCode);

  return {
    connectionId: id,
    pollSecret,
    connectUrl: connectUrl.toString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function approveExtensionConnection(userCode: string, userId: string) {
  const now = new Date();
  const connection = await db.query.extensionConnections.findFirst({
    where: and(
      eq(extensionConnections.userCodeHash, hashSecret(userCode)),
      eq(extensionConnections.status, "pending"),
      gt(extensionConnections.expiresAt, now)
    ),
  });

  if (!connection) return false;

  const approved = await db
    .update(extensionConnections)
    .set({ userId, status: "approved", approvedAt: now })
    .where(and(
      eq(extensionConnections.id, connection.id),
      eq(extensionConnections.status, "pending")
    ))
    .returning({ id: extensionConnections.id });

  return approved.length === 1;
}

export async function exchangeExtensionConnection(connectionId: string, pollSecret: string) {
  const now = new Date();
  const connection = await db.query.extensionConnections.findFirst({
    where: eq(extensionConnections.id, connectionId),
  });

  if (!connection || !secretsMatch(pollSecret, connection.pollSecretHash)) {
    return { status: "invalid" as const };
  }
  if (connection.expiresAt <= now) return { status: "expired" as const };
  if (connection.status === "pending") return { status: "pending" as const };
  if (connection.status !== "approved" || !connection.userId || connection.consumedAt) {
    return { status: "invalid" as const };
  }

  const rawToken = randomSecret(48);
  const expiresAt = new Date(Date.now() + EXTENSION_SESSION_LIFETIME_MS);
  const userId = await db.transaction(async (tx) => {
    const consumed = await tx
      .update(extensionConnections)
      .set({ status: "consumed", consumedAt: now })
      .where(and(
        eq(extensionConnections.id, connection.id),
        eq(extensionConnections.status, "approved"),
        isNull(extensionConnections.consumedAt)
      ))
      .returning({ userId: extensionConnections.userId });

    if (consumed.length !== 1 || !consumed[0].userId) return null;

    await tx.insert(extensionSessions).values({
      id: crypto.randomUUID(),
      userId: consumed[0].userId,
      tokenHash: hashSecret(rawToken),
      expiresAt,
    });
    return consumed[0].userId;
  });

  if (!userId) return { status: "invalid" as const };

  const access = await getUserAccess(userId);
  return { status: "connected" as const, token: rawToken, expiresAt: expiresAt.toISOString(), access };
}

export async function getUserAccess(userId: string) {
  const now = new Date();
  const [user, entitlement] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, email: true, name: true, image: true },
    }),
    db.query.entitlements.findFirst({
      where: and(
        eq(entitlements.userId, userId),
        eq(entitlements.status, "active"),
        or(isNull(entitlements.validUntil), gt(entitlements.validUntil, now))
      ),
    }),
  ]);

  return {
    authenticated: Boolean(user),
    paid: Boolean(entitlement),
    user: user ? { email: user.email, name: user.name, image: user.image } : null,
  };
}

export async function authenticateExtensionRequest(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token) return null;

  const now = new Date();
  const session = await db.query.extensionSessions.findFirst({
    where: and(
      eq(extensionSessions.tokenHash, hashSecret(token)),
      isNull(extensionSessions.revokedAt),
      gt(extensionSessions.expiresAt, now)
    ),
  });
  if (!session) return null;

  const access = await getUserAccess(session.userId);
  return { userId: session.userId, sessionId: session.id, access };
}

export async function revokeExtensionSession(request: Request) {
  const session = await authenticateExtensionRequest(request);
  if (!session) return false;

  await db
    .update(extensionSessions)
    .set({ revokedAt: new Date() })
    .where(eq(extensionSessions.id, session.sessionId));
  return true;
}

export async function requirePaidExtension(request: Request) {
  const session = await authenticateExtensionRequest(request);
  if (!session) {
    return { ok: false as const, response: NextResponse.json({ error: "Sign in to use Axe" }, { status: 401 }) };
  }
  if (!session.access.paid) {
    return { ok: false as const, response: NextResponse.json({ error: "Paid Axe access required" }, { status: 402 }) };
  }
  return { ok: true as const, userId: session.userId };
}
