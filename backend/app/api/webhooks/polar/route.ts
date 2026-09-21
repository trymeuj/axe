import { NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { processPolarCustomerState, processPolarSubscriptionEvent } from "@/lib/polar-billing";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const eventId = request.headers.get("webhook-id") ?? "";
  const secret = process.env.POLAR_WEBHOOK_SECRET;

  if (!secret) {
    console.error("Polar webhook rejected because POLAR_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }
  if (!eventId) return NextResponse.json({ error: "Missing webhook ID." }, { status: 400 });

  try {
    const event = validateEvent(rawBody, Object.fromEntries(request.headers), secret);

    if (event.type === "customer.state_changed") {
      if (!event.data.externalId) return NextResponse.json({ received: true, ignored: true });
      await processPolarCustomerState({
        eventId,
        eventType: event.type,
        eventCreatedAt: event.timestamp,
        userId: event.data.externalId,
        customerId: event.data.id,
        subscriptions: event.data.activeSubscriptions,
      });
      return NextResponse.json({ received: true });
    }

    switch (event.type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
      case "subscription.canceled":
      case "subscription.uncanceled":
      case "subscription.revoked":
      case "subscription.past_due": {
        const userId = event.data.customer.externalId;
        if (!userId) return NextResponse.json({ received: true, ignored: true });
        await processPolarSubscriptionEvent({
          eventId,
          eventType: event.type,
          eventCreatedAt: event.timestamp,
          userId,
          subscription: event.data,
        });
        return NextResponse.json({ received: true });
      }
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
    }
    console.error("Polar webhook failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Webhook could not be accepted." }, { status: 503 });
  }
}
