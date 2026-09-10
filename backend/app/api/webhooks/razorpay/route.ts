import { NextResponse } from "next/server";
import { processSubscriptionWebhook } from "@/lib/billing";
import { verifyWebhookSignature, type RazorpaySubscription } from "@/lib/razorpay";

export const runtime = "nodejs";
export const maxDuration = 10;

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.authenticated",
  "subscription.activated",
  "subscription.charged",
  "subscription.completed",
  "subscription.updated",
  "subscription.pending",
  "subscription.halted",
  "subscription.cancelled",
  "subscription.paused",
  "subscription.resumed",
]);

type Webhook = {
  event?: string;
  created_at?: number;
  payload?: {
    subscription?: { entity?: RazorpaySubscription };
    payment?: { entity?: Record<string, unknown> };
  };
};

function textValue(input: unknown) {
  return typeof input === "string" ? input : undefined;
}

function numberValue(input: unknown) {
  return typeof input === "number" && Number.isFinite(input) ? input : undefined;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventId = request.headers.get("x-razorpay-event-id") ?? "";

  try {
    if (!eventId) return NextResponse.json({ error: "Missing event ID." }, { status: 400 });
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as Webhook;
    if (!payload.event || !SUBSCRIPTION_EVENTS.has(payload.event)) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const subscription = payload.payload?.subscription?.entity;
    if (!subscription?.id) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const payment = payload.payload?.payment?.entity;
    await processSubscriptionWebhook({
      eventId,
      eventType: payload.event,
      eventCreatedAt: payload.created_at ? new Date(payload.created_at * 1000) : null,
      subscription,
      payment: payment && textValue(payment.id) ? {
        id: textValue(payment.id)!,
        amount: numberValue(payment.amount),
        currency: textValue(payment.currency),
        status: textValue(payment.status),
      } : null,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Webhook could not be accepted." }, { status: 503 });
  }
}
