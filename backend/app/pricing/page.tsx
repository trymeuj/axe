import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { PricingPlans } from "./PricingPlans";
import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing | Axe",
  description: "Simple monthly and quarterly pricing for Axe.",
};

function AxeMark() {
  return <span className={styles.mark} aria-hidden="true">A</span>;
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
          <h1 id="pricing-title">You know you&apos;ll do it once you have paid for it</h1>
          <p>Same Axe. Pick how you want to pay.</p>
        </div>

        <PricingPlans destination={destination} />

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
