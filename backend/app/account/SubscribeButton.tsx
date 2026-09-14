"use client";

import { useState } from "react";
import styles from "../auth/auth.module.css";

type CheckoutResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (response: CheckoutResponse) => void | Promise<void>;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let checkoutLoader: Promise<void> | undefined;

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  checkoutLoader ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Payment window could not load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Payment window could not load."));
    document.body.appendChild(script);
  });
  return checkoutLoader;
}

export function SubscribeButton({
  email,
  name,
  plan,
  region,
}: {
  email?: string | null;
  name?: string | null;
  plan: "monthly" | "quarterly";
  region: "standard" | "india";
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const price = region === "india"
    ? plan === "monthly" ? "₹799" : "₹1,599"
    : plan === "monthly" ? "$9.99" : "$19.99";
  const period = plan === "monthly" ? "Monthly" : "Quarterly";

  async function startCheckout() {
    setBusy(true);
    setMessage("");
    try {
      const [response] = await Promise.all([
        fetch("/api/billing/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, region }),
        }),
        loadCheckout(),
      ]);
      const data = await response.json() as { error?: string; subscriptionId?: string; keyId?: string };
      if (!response.ok || !data.subscriptionId || !data.keyId) {
        throw new Error(data.error ?? "Checkout could not be started.");
      }
      if (!window.Razorpay) throw new Error("Payment window is unavailable.");

      const checkout = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Axe",
        description: `Axe ${plan === "monthly" ? "Monthly" : "Quarterly"}`,
        prefill: { email: email ?? undefined, name: name ?? undefined },
        theme: { color: "#1d9bf0" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (payment) => {
          try {
            setMessage("Confirming your access…");
            const verification = await fetch("/api/billing/subscription/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            const result = await verification.json() as { error?: string };
            if (!verification.ok) throw new Error(result.error ?? "Payment could not be verified.");
            window.location.assign("/account?payment=success");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Payment could not be verified yet. Refresh shortly.");
            setBusy(false);
          }
        },
      });

      checkout.on("payment.failed", (failure) => {
        setMessage(failure.error?.description ?? "Payment was not completed. You can try again.");
        setBusy(false);
      });
      checkout.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout could not be started.");
      setBusy(false);
    }
  }

  return (
    <div className={styles.checkoutAction}>
      <button className={styles.primary} type="button" onClick={startCheckout} disabled={busy}>
        {busy ? "Opening secure checkout…" : `Continue with ${period} · ${price}`}
      </button>
      {message ? <p className={styles.checkoutMessage} role="status">{message}</p> : null}
      <small className={styles.paymentNote}>Secure recurring payment powered by Razorpay.</small>
    </div>
  );
}
