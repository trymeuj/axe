import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLatestPolarSubscription } from "@/lib/polar-billing";
import { createPolarPortalSession } from "@/lib/polar";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.redirect(new URL("/auth/signin", request.url));

  const subscription = await getLatestPolarSubscription(session.user.id);
  if (!subscription) {
    return NextResponse.json({ error: "No Polar subscription was found for this account." }, { status: 404 });
  }

  try {
    const portal = await createPolarPortalSession(session.user.id);
    return NextResponse.redirect(portal.customerPortalUrl);
  } catch (error) {
    console.error("Polar portal session creation failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "The subscription portal is temporarily unavailable." }, { status: 503 });
  }
}
