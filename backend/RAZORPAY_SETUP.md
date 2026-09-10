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
RAZORPAY_PLAN_ID
RAZORPAY_SUBSCRIPTION_CYCLES
```

The current test plan ID is `plan_TaRHVJ8Z4WtFX4`. Use `120` billing cycles for the monthly test plan.

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

After pricing is settled, create a new plan in Razorpay Live Mode. Add live keys, a new live webhook secret, the live plan ID, and the appropriate billing-cycle count to Vercel Production. Never reuse Test Mode credentials or the test webhook secret in Production.
