import { NextResponse } from "next/server";

function oauthDisabled() {
  return NextResponse.json(
    { error: "X OAuth is not used by the public-account MVP" },
    { status: 410 }
  );
}

export const GET = oauthDisabled;
export const POST = oauthDisabled;
