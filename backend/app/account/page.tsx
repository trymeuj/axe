import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getLatestSubscription } from "@/lib/billing";
import { getUserAccess } from "@/lib/extension-auth";
import { axePlanLabel } from "@/lib/razorpay";
import styles from "../auth/auth.module.css";
import { SubscribeButton } from "./SubscribeButton";

type AccountPageProps = {
  searchParams: Promise<{ plan?: string; region?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");
  const [access, subscription] = await Promise.all([
    getUserAccess(session.user.id),
    getLatestSubscription(session.user.id),
  ]);

  const statusLabels: Record<string, string> = {
    active: "Active",
    authenticated: "Active",
    created: "Awaiting payment",
    pending: "Payment pending",
    halted: "Payment issue",
    paused: "Paused",
    cancelled: "Cancelled",
    completed: "Completed",
  };
  const subscriptionStatus = subscription
    ? statusLabels[subscription.status] ?? subscription.status
    : access.paid ? "Active" : "Not active";
  const subscriptionIsActive = !subscription || ["active", "authenticated"].includes(subscription.status);
  const periodLabel = subscription?.status === "cancelled" ? "Access until" : "Next renewal";
  const selectedPlan = params.plan === "monthly" || params.plan === "quarterly" ? params.plan : null;
  const selectedRegion = params.region === "india" || params.region === "standard" ? params.region : null;

  return (
    <main className={styles.page}>
      <section className={`${styles.card} ${styles.accountCard}`}>
        <div className={styles.mark}>A</div>
        <p className={styles.eyebrow}>Your Axe account</p>
        <h1>{access.paid ? "Axe is active" : "Complete your access"}</h1>
        <p className={styles.copy}>
          {access.paid
            ? "Your paid access is active. You can connect and use the Axe extension."
            : "You are signed in. Complete checkout to unlock Axe in your extension."}
        </p>
        <p className={styles.identity}>{session.user.email}</p>
        {subscription ? (
          <section className={styles.subscription} aria-labelledby="subscription-heading">
            <div className={styles.subscriptionHeading}>
              <div>
                <span>SUBSCRIPTION</span>
                <h2 id="subscription-heading">{axePlanLabel(subscription.planId)}</h2>
              </div>
              <strong className={subscriptionIsActive ? undefined : styles.subscriptionStatusNeutral}>{subscriptionStatus}</strong>
            </div>
            <dl className={styles.subscriptionDetails}>
              <div>
                <dt>{periodLabel}</dt>
                <dd>{subscription.currentEnd ? formatAccountDate(subscription.currentEnd) : "Not available"}</dd>
              </div>
              <div>
                <dt>Payments completed</dt>
                <dd>{subscription.paidCount} of {subscription.totalCount}</dd>
              </div>
              <div>
                <dt>Subscription ID</dt>
                <dd className={styles.subscriptionId}>{subscription.id}</dd>
              </div>
            </dl>
          </section>
        ) : access.paid ? (
          <section className={styles.subscription} aria-label="Subscription status">
            <div className={styles.subscriptionHeading}>
              <div><span>ACCESS</span><h2>Paid access</h2></div>
              <strong>{subscriptionStatus}</strong>
            </div>
          </section>
        ) : null}
        {!access.paid && selectedPlan && selectedRegion ? (
          <SubscribeButton
            email={session.user.email}
            name={session.user.name}
            plan={selectedPlan}
            region={selectedRegion}
          />
        ) : !access.paid ? (
          <Link className={styles.primaryLink} href="/pricing">Choose a plan</Link>
        ) : null}
        <Link className={styles.primaryLink} href="/">Go to website</Link>
        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}>
          <button className={styles.secondary} type="submit">Sign out</button>
        </form>
      </section>
    </main>
  );
}

function formatAccountDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
