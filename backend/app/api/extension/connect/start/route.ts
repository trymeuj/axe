import { NextRequest, NextResponse } from "next/server";
import { createExtensionConnection } from "@/lib/extension-auth";

export const maxDuration = 10;

export async function POST(request: NextRequest) {
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const connection = await createExtensionConnection(appOrigin);
  return NextResponse.json(connection, { status: 201 });
}
