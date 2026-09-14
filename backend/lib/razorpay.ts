import { createHmac, timingSafeEqual } from "node:crypto";

export type RazorpaySubscription = {
  id: string;
  plan_id: string;
  status: string;
  current_start: number | null;
  current_end: number | null;
  ended_at: number | null;
  paid_count: number;
  total_count: number;
};

export type AxePlan = "monthly" | "quarterly";
export type AxeRegion = "standard" | "india";

const PLAN_CONFIG = {
  "standard:monthly": { env: "RAZORPAY_PLAN_MONTHLY_ID", cycles: 120, label: "Monthly · $9.99" },
  "standard:quarterly": { env: "RAZORPAY_PLAN_QUARTERLY_ID", cycles: 40, label: "Quarterly · $19.99" },
  "india:monthly": { env: "RAZORPAY_PLAN_INDIA_MONTHLY_ID", cycles: 120, label: "India Monthly · ₹799" },
  "india:quarterly": { env: "RAZORPAY_PLAN_INDIA_QUARTERLY_ID", cycles: 40, label: "India Quarterly · ₹1,599" },
} as const;

export function resolveAxePlan(plan: unknown, region: unknown) {
  if (plan !== "monthly" && plan !== "quarterly") return null;
  if (region !== "standard" && region !== "india") return null;
  const config = PLAN_CONFIG[`${region}:${plan}`];
  const planId = process.env[config.env] ?? process.env.RAZORPAY_PLAN_ID;
  if (!planId) throw new Error(`${config.env} is not configured.`);
  return { plan, region, planId, cycles: config.cycles };
}

export function axePlanLabel(planId: string) {
  return Object.values(PLAN_CONFIG).find((config) => process.env[config.env] === planId)?.label
    ?? "Axe subscription";
}

function credentials() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay API keys are not configured.");
  return { keyId, keySecret };
}

function safeHexEqual(expected: string, received: string) {
  if (!/^[a-f0-9]+$/i.test(received) || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

async function razorpayRequest<T>(path: string, init?: RequestInit) {
  const { keyId, keySecret } = credentials();
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  const payload = await response.json() as T | { error?: { description?: string } };
  if (!response.ok) {
    const message = (payload as { error?: { description?: string } }).error?.description;
    throw new Error(message ?? "Razorpay request failed.");
  }
  return payload as T;
}

export function publicRazorpayKey() {
  return credentials().keyId;
}

export async function createRazorpaySubscription(userId: string, planId: string, totalCount: number) {
  return razorpayRequest<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: true,
      notes: { axe_user_id: userId, product: "axe" },
    }),
  });
}

export async function fetchRazorpaySubscription(subscriptionId: string) {
  return razorpayRequest<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export function verifySubscriptionSignature(paymentId: string, subscriptionId: string, signature: string) {
  const { keySecret } = credentials();
  const expected = createHmac("sha256", keySecret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");
  return safeHexEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured.");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeHexEqual(expected, signature);
}
