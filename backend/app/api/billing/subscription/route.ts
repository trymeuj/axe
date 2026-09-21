import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentSubscription, saveCreatedSubscription } from "@/lib/billing";
import { getUserAccess } from "@/lib/extension-auth";
import { createRazorpaySubscription, publicRazorpayKey, resolveAxePlan } from "@/lib/razorpay";
import { createPolarCheckout, resolvePolarProductId } from "@/lib/polar";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in before starting checkout." }, { status: 401 });
    }

    const access = await getUserAccess(session.user.id);
    if (access.paid) {
      return NextResponse.json({ error: "Your Axe access is already active." }, { status: 409 });
    }

    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    const region = body?.region;
    if (region !== "india" && region !== "standard") {
      return NextResponse.json({ error: "Choose a valid Axe plan." }, { status: 400 });
    }

    if (region === "standard") {
      if (!session.user.email) {
        return NextResponse.json({ error: "Your account needs an email address for checkout." }, { status: 400 });
      }
      const selectedPlan = resolvePolarProductId(body?.plan);
      if (!selectedPlan) {
        return NextResponse.json({ error: "Choose a valid Axe plan." }, { status: 400 });
      }
      const checkout = await createPolarCheckout({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        productId: selectedPlan.productId,
      });
      return NextResponse.json({
        provider: "polar",
        checkoutUrl: checkout.url,
      }, { headers: { "Cache-Control": "no-store" } });
    }

    const selectedPlan = resolveAxePlan(body?.plan, region);
    if (!selectedPlan) {
      return NextResponse.json({ error: "Choose a valid Axe plan." }, { status: 400 });
    }
    const existing = await getCurrentSubscription(session.user.id);
    if (existing && existing.status !== "created") {
      return NextResponse.json({
        error: "This subscription is already being processed. Check your access again shortly.",
      }, { status: 409 });
    }

    let subscriptionId = existing?.planId === selectedPlan.planId ? existing.id : undefined;
    if (!subscriptionId) {
      const subscription = await createRazorpaySubscription(
        session.user.id,
        selectedPlan.planId,
        selectedPlan.cycles
      );
      await saveCreatedSubscription(session.user.id, subscription);
      subscriptionId = subscription.id;
    }

    return NextResponse.json({
      provider: "razorpay",
      subscriptionId,
      keyId: publicRazorpayKey(),
      email: session.user.email,
      name: session.user.name,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Subscription checkout creation failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not start checkout. Please try again." }, { status: 503 });
  }
}
