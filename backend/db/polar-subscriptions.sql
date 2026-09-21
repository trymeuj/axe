-- Run once in the Neon SQL Editor before enabling Polar checkout.
CREATE TABLE IF NOT EXISTS polar_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  ended_at TIMESTAMP,
  last_event_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS polar_subscriptions_user_idx
  ON polar_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS polar_subscriptions_customer_idx
  ON polar_subscriptions (customer_id);

CREATE TABLE IF NOT EXISTS polar_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  customer_id TEXT,
  subscription_id TEXT,
  event_created_at TIMESTAMP,
  processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
