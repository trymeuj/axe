# Axe Razorpay subscription setup

Axe uses Razorpay Subscriptions. Razorpay owns payment instruments; Axe stores only subscription, payment, webhook, and entitlement metadata in Neon.

## Test environment

1. Use Razorpay Test Mode and the `Axe Test Monthly` plan.
2. Run `db/razorpay-subscriptions.sql` once in the connected Neon database.
3. Add these variables to the local or Vercel Preview environment:

```text
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
RAZORPAY_PLAN_MONTHLY_ID
RAZORPAY_PLAN_QUARTERLY_ID
RAZORPAY_PLAN_INDIA_MONTHLY_ID
RAZORPAY_PLAN_INDIA_QUARTERLY_ID
```

The checkout maps a server-validated plan and region selection to one of these four plan IDs. Monthly subscriptions use 120 billing cycles and quarterly subscriptions use 40.

## Webhook

Create a Test Mode webhook pointing to:

```text
https://PREVIEW_DOMAIN/api/webhooks/razorpay
```

Subscribe to:

- `subscription.authenticated`
- `subscription.activated`
- `subscription.charged`
- `subscription.completed`
- `subscription.updated`
- `subscription.pending`
- `subscription.halted`
- `subscription.cancelled`
- `subscription.paused`
- `subscription.resumed`

Use a new random webhook secret and store the identical value as `RAZORPAY_WEBHOOK_SECRET`. The endpoint validates the raw request body, rejects invalid signatures, deduplicates `x-razorpay-event-id`, and ignores subscriptions belonging to another plan.

## Production cutover

For Live Mode, add the live keys, a dedicated live webhook secret, and all four live plan IDs to Vercel Production. Never reuse Test Mode credentials or the test webhook secret in Production.
