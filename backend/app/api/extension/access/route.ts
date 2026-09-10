import { NextRequest, NextResponse } from "next/server";
import { authenticateExtensionRequest, revokeExtensionSession } from "@/lib/extension-auth";

export const maxDuration = 10;

export async function GET(request: NextRequest) {
  const session = await authenticateExtensionRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, paid: false, user: null }, { status: 401 });
  }
  return NextResponse.json(session.access);
}

export async function DELETE(request: NextRequest) {
  const revoked = await revokeExtensionSession(request);
  return revoked
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
