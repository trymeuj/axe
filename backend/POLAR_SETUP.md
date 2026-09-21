# Axe Polar subscription setup

Polar handles international subscriptions. India continues to use Razorpay so UPI remains available.

## Database

Run `db/polar-subscriptions.sql` once in Neon before deploying the Polar routes.

## Environment

Set these in the matching Vercel environment:

```text
POLAR_SERVER=production
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_PRODUCT_MONTHLY_ID=
POLAR_PRODUCT_QUARTERLY_ID=
```

The current Odd Pages organization and product IDs live on Polar's production API, even while its checkout is marked as test mode. The access token needs `checkouts:write` and `customer_sessions:write`. Keep it server-only.

The product IDs are the catalogue product IDs, not checkout-link IDs. Axe creates a fresh checkout session for the authenticated user and sends the Axe user ID as Polar's `external_customer_id`; the static dashboard checkout links are not used by the app.

## Webhook

After deploying, create a raw Polar webhook at:

```text
https://axe.oddpages.site/api/webhooks/polar
```

Choose API version `2026-04`, matching the installed Polar SDK, and subscribe to:

- `customer.state_changed`
- `subscription.created`
- `subscription.updated`
- `subscription.active`
- `subscription.canceled`
- `subscription.uncanceled`
- `subscription.revoked`
- `subscription.past_due`

Copy the generated signing secret into `POLAR_WEBHOOK_SECRET`. The route verifies Standard Webhooks signatures, deduplicates `webhook-id`, ignores unknown product IDs, and only associates a customer whose signed `external_id` matches an existing Axe user.

`customer.state_changed` provides a full active-state reconciliation. The subscription events preserve explicit lifecycle status and period dates. Cancellation at period end remains active until Polar removes/revokes the subscription; `past_due`, `unpaid`, and revoked subscriptions do not grant Polar access. Effective Axe access is recomputed across both providers, so one provider cannot revoke valid access from the other.

## Test

1. Use the Odd Pages organization token and the configured product IDs while Polar checkout remains in test mode.
2. Sign in to Axe and uncheck **I am based in India** on `/pricing`.
3. Start monthly and quarterly checkout and confirm the email is prefilled.
4. Complete a sandbox payment and confirm `/account` shows active access.
5. Open **Manage subscription**, cancel at period end, and confirm access remains active through the displayed date.
6. Send/resend webhook deliveries and confirm duplicates return success without changing state twice.

Do not switch to production until this flow succeeds end to end in sandbox.
