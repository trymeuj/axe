import { Polar } from "@polar-sh/sdk";

export type PolarPlan = "monthly" | "quarterly";

function polarServer() {
  const server = process.env.POLAR_SERVER ?? "sandbox";
  if (server !== "sandbox" && server !== "production") {
    throw new Error("POLAR_SERVER must be either sandbox or production.");
  }
  return server;
}

export function polarClient() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) throw new Error("POLAR_ACCESS_TOKEN is not configured.");
  return new Polar({ accessToken, server: polarServer() });
}

export function resolvePolarProductId(plan: unknown) {
  if (plan !== "monthly" && plan !== "quarterly") return null;
  const envName = plan === "monthly" ? "POLAR_PRODUCT_MONTHLY_ID" : "POLAR_PRODUCT_QUARTERLY_ID";
  const productId = process.env[envName];
  if (!productId) throw new Error(`${envName} is not configured.`);
  return { plan, productId };
}

export function isAxePolarProduct(productId: string) {
  return [process.env.POLAR_PRODUCT_MONTHLY_ID, process.env.POLAR_PRODUCT_QUARTERLY_ID]
    .filter(Boolean)
    .includes(productId);
}

function appUrl() {
  const vercelProductionHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL
    ?? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  const configured = process.env.NEXT_PUBLIC_APP_URL
    ?? (vercelProductionHost ? `https://${vercelProductionHost}` : undefined)
    ?? (process.env.NODE_ENV === "production" ? "https://axe.oddpages.site" : undefined);
  if (!configured) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  return new URL(configured);
}

export async function createPolarCheckout(input: {
  userId: string;
  email: string;
  name?: string | null;
  productId: string;
}) {
  const origin = appUrl();
  const successUrl = new URL("/account", origin);
  successUrl.searchParams.set("payment", "success");
  successUrl.searchParams.set("checkout_id", "{CHECKOUT_ID}");

  return polarClient().checkouts.create({
    products: [input.productId],
    externalCustomerId: input.userId,
    customerEmail: input.email,
    customerName: input.name ?? undefined,
    successUrl: successUrl.toString(),
    returnUrl: new URL("/pricing", origin).toString(),
    allowDiscountCodes: false,
    requireBillingAddress: false,
    allowTrial: false,
  });
}

export async function createPolarPortalSession(userId: string) {
  return polarClient().customerSessions.create({
    externalCustomerId: userId,
    returnUrl: new URL("/account", appUrl()).toString(),
  });
}

export function polarPlanLabel(productId: string) {
  if (productId === process.env.POLAR_PRODUCT_MONTHLY_ID) return "Monthly · $9.99";
  if (productId === process.env.POLAR_PRODUCT_QUARTERLY_ID) return "Quarterly · $19.99";
  return "Axe subscription";
}
