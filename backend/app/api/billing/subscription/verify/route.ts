import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { confirmSubscriptionCheckout, getOwnedSubscription } from "@/lib/billing";
import { fetchRazorpaySubscription, verifySubscriptionSignature } from "@/lib/razorpay";

export const runtime = "nodejs";
export const maxDuration = 10;

function value(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Your sign-in session expired." }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const paymentId = value(body.razorpay_payment_id);
    const subscriptionId = value(body.razorpay_subscription_id);
    const signature = value(body.razorpay_signature);
    if (!paymentId || !subscriptionId || !signature) {
      return NextResponse.json({ error: "Missing payment verification details." }, { status: 400 });
    }

    const owned = await getOwnedSubscription(session.user.id, subscriptionId);
    if (!owned || !verifySubscriptionSignature(paymentId, owned.id, signature)) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const subscription = await fetchRazorpaySubscription(owned.id);
    if (subscription.plan_id !== owned.planId) {
      return NextResponse.json({ error: "Payment plan does not match Axe." }, { status: 400 });
    }
    await confirmSubscriptionCheckout(session.user.id, subscription, paymentId);

    return NextResponse.json({
      verified: true,
      active: subscription.status === "authenticated" || subscription.status === "active",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Razorpay subscription verification failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We could not verify the payment yet." }, { status: 503 });
  }
}
