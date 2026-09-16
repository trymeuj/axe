"use client";

import Link from "next/link";
import styles from "./pricing.module.css";

const features = [
  "Track up to 5 creators",
  "Recommendations on how you can jump in",
  "3 refreshes a day",
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4.5 10.2 3.4 3.4 7.7-7.7" />
    </svg>
  );
}

function checkoutDestination(destination: string, period: "monthly" | "quarterly", india: boolean) {
  const query = new URLSearchParams({
    plan: period,
    region: india ? "india" : "standard",
  });
  return `${destination}?${query.toString()}`;
}

export function PricingPlans({ destination }: { destination: string }) {
  const indiaPricing = true;
  const monthlyPrice = "$7.99";
  const quarterlyPrice = "$15.99";

  return (
    <>
      <div className={styles.regionControl}>
        <label className={`${styles.regionCheck} ${styles.regionCheckLocked}`}>
          <input
            type="checkbox"
            checked={indiaPricing}
            disabled
          />
          <span className={styles.checkbox} aria-hidden="true"><CheckIcon /></span>
          <span>I am based in India</span>
        </label>
        <span className={styles.infoWrap}>
          <button
            className={styles.infoButton}
            type="button"
            aria-label="Pricing availability information"
            aria-describedby="india-pricing-tooltip"
          >
            i
          </button>
          <span className={styles.tooltip} id="india-pricing-tooltip" role="tooltip">
            Soon available outside India.
          </span>
        </span>
      </div>

      {indiaPricing ? (
        <p className={styles.regionApplied} role="status">
          India regional pricing applied. Billing country will be verified at checkout.
        </p>
      ) : null}

      <div className={styles.plans}>
        <article className={styles.plan}>
          <div className={styles.planTop}>
            <div>
              <span className={styles.planName}>Monthly</span>
              <div className={styles.price}>
                <strong>{monthlyPrice}</strong>
                <span>USD / month</span>
              </div>
            </div>
          </div>

          <ul className={styles.features}>
            {features.map((feature) => (
              <li key={feature}><CheckIcon /><span>{feature}</span></li>
            ))}
          </ul>

          <Link
            className={styles.planCta}
            href={checkoutDestination(destination, "monthly", indiaPricing)}
          >
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
                <strong>{quarterlyPrice}</strong>
                <span>USD / 3 months</span>
              </div>
            </div>
            <span className={styles.saving}>SAVE 33%</span>
          </div>

          <ul className={styles.features}>
            {features.map((feature) => (
              <li key={feature}><CheckIcon /><span>{feature}</span></li>
            ))}
          </ul>

          <Link
            className={`${styles.planCta} ${styles.primaryCta}`}
            href={checkoutDestination(destination, "quarterly", indiaPricing)}
          >
            Get started with AXE
            <span aria-hidden="true">↗</span>
          </Link>
          <p className={styles.billingNote}>Billed every 3 months. Cancel anytime.</p>
        </article>
      </div>
    </>
  );
}
