import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing | Axe",
  description: "Simple monthly and quarterly pricing for Axe.",
};

const features = [
  "Track up to 5 creators",
  "Recommendations on how you can jump in",
  "3 refreshes a day",
];

function AxeMark() {
  return <span className={styles.mark} aria-hidden="true">A</span>;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4.5 10.2 3.4 3.4 7.7-7.7" />
    </svg>
  );
}

export default async function PricingPage() {
  const session = await auth();
  const destination = session?.user?.id ? "/account" : "/auth/signin";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Axe home">
          <AxeMark />
          <span>Axe</span>
        </Link>
        <Link className={styles.headerCta} href={destination}>
          Get started with AXE
        </Link>
      </header>

      <section className={styles.pricing} aria-labelledby="pricing-title">
        <div className={styles.intro}>
          <span>PRICING</span>
          <h1 id="pricing-title">Stay consistent on X.</h1>
          <p>Same Axe. Pick how you want to pay.</p>
        </div>

        <div className={styles.plans}>
          <article className={styles.plan}>
            <div className={styles.planTop}>
              <div>
                <span className={styles.planName}>Monthly</span>
                <div className={styles.price}>
                  <strong>$9.99</strong>
                  <span>USD / month</span>
                </div>
              </div>
            </div>

            <ul className={styles.features}>
              {features.map((feature) => (
                <li key={feature}><CheckIcon /><span>{feature}</span></li>
              ))}
            </ul>

            <Link className={styles.planCta} href={destination}>
              Get started with AXE
              <span aria-hidden="true">↗</span>
            </Link>
            <p className={styles.billingNote}>Billed monthly. Cancel anytime.</p>
          </article>

          <article className={`${styles.plan} ${styles.featured}`}>
            <div className={styles.featuredGlow} aria-hidden="true" />
            <div className={styles.planTop}>
              <div>
                <span className={styles.planName}>Quarterly</span>
                <div className={styles.price}>
                  <strong>$19.99</strong>
                  <span>USD / 3 months</span>
                </div>
              </div>
              <span className={styles.saving}>SAVE $10</span>
            </div>

            <ul className={styles.features}>
              {features.map((feature) => (
                <li key={feature}><CheckIcon /><span>{feature}</span></li>
              ))}
            </ul>

            <Link className={`${styles.planCta} ${styles.primaryCta}`} href={destination}>
              Get started with AXE
              <span aria-hidden="true">↗</span>
            </Link>
            <p className={styles.billingNote}>Billed every 3 months. Cancel anytime.</p>
          </article>
        </div>

        <p className={styles.cancelNote}>
          Cancel anytime. Your access continues until the end of your billing period.
        </p>
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Axe</span>
        <nav aria-label="Legal and support">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/support">Support</Link>
        </nav>
      </footer>
    </main>
  );
}
