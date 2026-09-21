import { and, desc, eq, inArray, isNull, lte, notInArray, or } from "drizzle-orm";
import type { CustomerStateSubscription } from "@polar-sh/sdk/models/components/customerstatesubscription";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import { db } from "@/db";
import { polarSubscriptions, polarWebhookEvents, users } from "@/db/schema";
import { recomputeEffectiveEntitlement } from "@/lib/billing";
import { isAxePolarProduct } from "@/lib/polar";

type PolarSubscriptionState = Pick<Subscription,
  "id" | "customerId" | "productId" | "status" | "cancelAtPeriodEnd" |
  "currentPeriodStart" | "currentPeriodEnd" | "endedAt"
>;

export async function getLatestPolarSubscription(userId: string) {
  return db.query.polarSubscriptions.findFirst({
    where: eq(polarSubscriptions.userId, userId),
    orderBy: [desc(polarSubscriptions.createdAt)],
  });
}

async function userExists(userId: string) {
  return db.query.users.findFirst({ where: eq(users.id, userId), columns: { id: true } });
}

function fromCustomerState(subscription: CustomerStateSubscription, customerId: string): PolarSubscriptionState {
  return {
    id: subscription.id,
    customerId,
    productId: subscription.productId,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    endedAt: subscription.endsAt,
  };
}

export async function processPolarSubscriptionEvent(input: {
  eventId: string;
  eventType: string;
  eventCreatedAt: Date;
  userId: string;
  subscription: PolarSubscriptionState;
}) {
  if (!isAxePolarProduct(input.subscription.productId) || !await userExists(input.userId)) {
    return { ignored: true };
  }

  return db.transaction(async (tx) => {
    const claimed = await tx.insert(polarWebhookEvents).values({
      id: input.eventId,
      eventType: input.eventType,
      customerId: input.subscription.customerId,
      subscriptionId: input.subscription.id,
      eventCreatedAt: input.eventCreatedAt,
    }).onConflictDoNothing({ target: polarWebhookEvents.id }).returning({ id: polarWebhookEvents.id });
    if (claimed.length === 0) return { duplicate: true };

    await tx.insert(polarSubscriptions).values({
      id: input.subscription.id,
      userId: input.userId,
      customerId: input.subscription.customerId,
      productId: input.subscription.productId,
      status: input.subscription.status,
      cancelAtPeriodEnd: input.subscription.cancelAtPeriodEnd,
      currentPeriodStart: input.subscription.currentPeriodStart,
      currentPeriodEnd: input.subscription.currentPeriodEnd,
      endedAt: input.subscription.endedAt,
      lastEventAt: input.eventCreatedAt,
    }).onConflictDoUpdate({
      target: polarSubscriptions.id,
      set: {
        status: input.subscription.status,
        cancelAtPeriodEnd: input.subscription.cancelAtPeriodEnd,
        currentPeriodStart: input.subscription.currentPeriodStart,
        currentPeriodEnd: input.subscription.currentPeriodEnd,
        endedAt: input.subscription.endedAt,
        lastEventAt: input.eventCreatedAt,
        updatedAt: new Date(),
      },
      setWhere: or(
        isNull(polarSubscriptions.lastEventAt),
        lte(polarSubscriptions.lastEventAt, input.eventCreatedAt)
      ),
    });

    await recomputeEffectiveEntitlement(tx, input.userId);
    return { processed: true };
  });
}

export async function processPolarCustomerState(input: {
  eventId: string;
  eventType: string;
  eventCreatedAt: Date;
  userId: string;
  customerId: string;
  subscriptions: CustomerStateSubscription[];
}) {
  if (!await userExists(input.userId)) return { ignored: true };
  const subscriptions = input.subscriptions.filter((item) => isAxePolarProduct(item.productId));

  return db.transaction(async (tx) => {
    const claimed = await tx.insert(polarWebhookEvents).values({
      id: input.eventId,
      eventType: input.eventType,
      customerId: input.customerId,
      eventCreatedAt: input.eventCreatedAt,
    }).onConflictDoNothing({ target: polarWebhookEvents.id }).returning({ id: polarWebhookEvents.id });
    if (claimed.length === 0) return { duplicate: true };

    for (const item of subscriptions) {
      const subscription = fromCustomerState(item, input.customerId);
      await tx.insert(polarSubscriptions).values({
        ...subscription,
        userId: input.userId,
        lastEventAt: input.eventCreatedAt,
      }).onConflictDoUpdate({
        target: polarSubscriptions.id,
        set: {
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          endedAt: subscription.endedAt,
          lastEventAt: input.eventCreatedAt,
          updatedAt: new Date(),
        },
        setWhere: or(
          isNull(polarSubscriptions.lastEventAt),
          lte(polarSubscriptions.lastEventAt, input.eventCreatedAt)
        ),
      });
    }

    const activeIds = subscriptions.map((item) => item.id);
    const missing = activeIds.length === 0
      ? eq(polarSubscriptions.customerId, input.customerId)
      : and(
          eq(polarSubscriptions.customerId, input.customerId),
          notInArray(polarSubscriptions.id, activeIds)
        );
    await tx.update(polarSubscriptions).set({
      status: "revoked",
      endedAt: input.eventCreatedAt,
      lastEventAt: input.eventCreatedAt,
      updatedAt: new Date(),
    }).where(and(
      missing,
      inArray(polarSubscriptions.status, ["active", "trialing"]),
      or(
        isNull(polarSubscriptions.lastEventAt),
        lte(polarSubscriptions.lastEventAt, input.eventCreatedAt)
      )
    ));

    await recomputeEffectiveEntitlement(tx, input.userId);
    return { processed: true };
  });
}
