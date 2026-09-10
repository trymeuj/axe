import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentSubscription, saveCreatedSubscription } from "@/lib/billing";
import { getUserAccess } from "@/lib/extension-auth";
import { createRazorpaySubscription, publicRazorpayKey } from "@/lib/razorpay";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in before starting checkout." }, { status: 401 });
    }

    const access = await getUserAccess(session.user.id);
    if (access.paid) {
      return NextResponse.json({ error: "Your Axe access is already active." }, { status: 409 });
    }

    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) throw new Error("RAZORPAY_PLAN_ID is not configured.");
    const existing = await getCurrentSubscription(session.user.id);
    if (existing && existing.status !== "created") {
      return NextResponse.json({
        error: "This subscription is already being processed. Check your access again shortly.",
      }, { status: 409 });
    }

    let subscriptionId = existing?.planId === planId ? existing.id : undefined;
    if (!subscriptionId) {
      const subscription = await createRazorpaySubscription(session.user.id);
      await saveCreatedSubscription(session.user.id, subscription);
      subscriptionId = subscription.id;
    }

    return NextResponse.json({
      subscriptionId,
      keyId: publicRazorpayKey(),
      email: session.user.email,
      name: session.user.name,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Razorpay subscription creation failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not start checkout. Please try again." }, { status: 503 });
  }
}
