-- Run once in the Neon SQL Editor before enabling Axe checkout.
-- This migration only adds Razorpay subscription records; it does not alter existing users.

CREATE TABLE IF NOT EXISTS razorpay_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  current_start TIMESTAMP,
  current_end TIMESTAMP,
  ended_at TIMESTAMP,
  paid_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL,
  last_event_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS razorpay_subscriptions_user_idx
  ON razorpay_subscriptions (user_id);

CREATE TABLE IF NOT EXISTS razorpay_payments (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL REFERENCES razorpay_subscriptions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS razorpay_payments_subscription_idx
  ON razorpay_payments (subscription_id);

CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  subscription_id TEXT,
  payment_id TEXT,
  event_created_at TIMESTAMP,
  processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
