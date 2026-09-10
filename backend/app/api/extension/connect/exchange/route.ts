import { NextRequest, NextResponse } from "next/server";
import { exchangeExtensionConnection } from "@/lib/extension-auth";

export const maxDuration = 10;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    connectionId?: unknown;
    pollSecret?: unknown;
  } | null;

  if (typeof body?.connectionId !== "string" || typeof body.pollSecret !== "string") {
    return NextResponse.json({ error: "Invalid connection request" }, { status: 400 });
  }

  const result = await exchangeExtensionConnection(body.connectionId, body.pollSecret);
  if (result.status === "pending") return NextResponse.json(result, { status: 202 });
  if (result.status === "expired") return NextResponse.json(result, { status: 410 });
  if (result.status === "invalid") return NextResponse.json(result, { status: 401 });
  return NextResponse.json(result);
}
