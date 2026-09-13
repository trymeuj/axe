import { and, desc, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import {
  entitlements,
  razorpayPayments,
  razorpaySubscriptions,
  razorpayWebhookEvents,
} from "@/db/schema";
import type { RazorpaySubscription } from "@/lib/razorpay";

const REUSABLE_STATUSES = ["created", "authenticated", "active", "pending"];

function fromUnix(value: number | null | undefined) {
  return value ? new Date(value * 1000) : null;
}

export async function getCurrentSubscription(userId: string) {
  return db.query.razorpaySubscriptions.findFirst({
    where: and(
      eq(razorpaySubscriptions.userId, userId),
      inArray(razorpaySubscriptions.status, REUSABLE_STATUSES)
    ),
    orderBy: [desc(razorpaySubscriptions.createdAt)],
  });
}

export async function getLatestSubscription(userId: string) {
  return db.query.razorpaySubscriptions.findFirst({
    where: eq(razorpaySubscriptions.userId, userId),
    orderBy: [desc(razorpaySubscriptions.createdAt)],
  });
}

export async function saveCreatedSubscription(userId: string, subscription: RazorpaySubscription) {
  await db.insert(razorpaySubscriptions).values({
    id: subscription.id,
    userId,
    planId: subscription.plan_id,
    status: subscription.status,
    currentStart: fromUnix(subscription.current_start),
    currentEnd: fromUnix(subscription.current_end),
    endedAt: fromUnix(subscription.ended_at),
    paidCount: subscription.paid_count,
    totalCount: subscription.total_count,
  }).onConflictDoNothing({ target: razorpaySubscriptions.id });
}

export async function getOwnedSubscription(userId: string, subscriptionId: string) {
  return db.query.razorpaySubscriptions.findFirst({
    where: and(
      eq(razorpaySubscriptions.id, subscriptionId),
      eq(razorpaySubscriptions.userId, userId)
    ),
  });
}

export async function confirmSubscriptionCheckout(
  userId: string,
  subscription: RazorpaySubscription,
  paymentId: string
) {
  await db.transaction(async (tx) => {
    await tx.update(razorpaySubscriptions).set({
      status: subscription.status,
      currentStart: fromUnix(subscription.current_start),
      currentEnd: fromUnix(subscription.current_end),
      endedAt: fromUnix(subscription.ended_at),
      paidCount: subscription.paid_count,
      totalCount: subscription.total_count,
      updatedAt: new Date(),
    }).where(and(
      eq(razorpaySubscriptions.id, subscription.id),
      eq(razorpaySubscriptions.userId, userId)
    ));

    await tx.insert(razorpayPayments).values({
      id: paymentId,
      subscriptionId: subscription.id,
      userId,
      status: "authenticated",
    }).onConflictDoUpdate({
      target: razorpayPayments.id,
      set: { status: "authenticated", updatedAt: new Date() },
    });

    const paidThrough = fromUnix(subscription.current_end);
    if (
      (subscription.status === "authenticated" || subscription.status === "active")
      && paidThrough
      && paidThrough > new Date()
    ) {
      await tx.update(entitlements).set({
        status: "active",
        validUntil: paidThrough,
        source: "razorpay_subscription",
        updatedAt: new Date(),
      }).where(eq(entitlements.userId, userId));
    }
  });
}

type WebhookInput = {
  eventId: string;
  eventType: string;
  eventCreatedAt: Date | null;
  subscription: RazorpaySubscription;
  payment?: {
    id: string;
    amount?: number;
    currency?: string;
    status?: string;
  } | null;
};

export async function processSubscriptionWebhook(input: WebhookInput) {
  return db.transaction(async (tx) => {
    const claimed = await tx.insert(razorpayWebhookEvents).values({
      id: input.eventId,
      eventType: input.eventType,
      subscriptionId: input.subscription.id,
      paymentId: input.payment?.id ?? null,
      eventCreatedAt: input.eventCreatedAt,
    }).onConflictDoNothing({ target: razorpayWebhookEvents.id }).returning({ id: razorpayWebhookEvents.id });

    if (claimed.length === 0) return { duplicate: true };

    const existing = await tx.query.razorpaySubscriptions.findFirst({
      where: eq(razorpaySubscriptions.id, input.subscription.id),
    });
    if (!existing) return { ignored: true };

    const eventTime = input.eventCreatedAt ?? new Date();
    const updated = await tx.update(razorpaySubscriptions).set({
      status: input.subscription.status,
      currentStart: fromUnix(input.subscription.current_start),
      currentEnd: fromUnix(input.subscription.current_end),
      endedAt: fromUnix(input.subscription.ended_at),
      paidCount: input.subscription.paid_count,
      totalCount: input.subscription.total_count,
      lastEventAt: eventTime,
      updatedAt: new Date(),
    }).where(and(
      eq(razorpaySubscriptions.id, input.subscription.id),
      or(
        isNull(razorpaySubscriptions.lastEventAt),
        lte(razorpaySubscriptions.lastEventAt, eventTime)
      )
    )).returning({ userId: razorpaySubscriptions.userId });

    if (input.payment?.id) {
      await tx.insert(razorpayPayments).values({
        id: input.payment.id,
        subscriptionId: input.subscription.id,
        userId: existing.userId,
        amount: input.payment.amount,
        currency: input.payment.currency,
        status: input.payment.status,
      }).onConflictDoUpdate({
        target: razorpayPayments.id,
        set: {
          amount: input.payment.amount,
          currency: input.payment.currency,
          status: input.payment.status,
          updatedAt: new Date(),
        },
      });
    }

    if (updated.length === 0) return { stale: true };

    const paidThrough = fromUnix(input.subscription.current_end);
    const active = ["authenticated", "active"].includes(input.subscription.status)
      && paidThrough
      && paidThrough > new Date();
    const retainUntilEnd = ["pending", "halted", "cancelled", "completed", "paused"].includes(input.subscription.status)
      && paidThrough
      && paidThrough > new Date();

    await tx.update(entitlements).set({
      status: active || retainUntilEnd ? "active" : input.subscription.status,
      validUntil: paidThrough,
      source: "razorpay_subscription",
      updatedAt: new Date(),
    }).where(eq(entitlements.userId, existing.userId));

    return { processed: true };
  });
}
