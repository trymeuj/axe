import {
  integer,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    googleSubject: text("google_subject").notNull(),
    email: text("email").notNull(),
    name: text("name"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("users_google_subject_idx").on(t.googleSubject),
    uniqueIndex("users_email_idx").on(t.email),
  ]
);

export const entitlements = pgTable("entitlements", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("unpaid"),
  validUntil: timestamp("valid_until"),
  source: text("source").notNull().default("none"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const razorpaySubscriptions = pgTable(
  "razorpay_subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: text("plan_id").notNull(),
    status: text("status").notNull().default("created"),
    currentStart: timestamp("current_start"),
    currentEnd: timestamp("current_end"),
    endedAt: timestamp("ended_at"),
    paidCount: integer("paid_count").notNull().default(0),
    totalCount: integer("total_count").notNull(),
    lastEventAt: timestamp("last_event_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("razorpay_subscriptions_user_idx").on(t.userId)]
);

export const razorpayPayments = pgTable(
  "razorpay_payments",
  {
    id: text("id").primaryKey(),
    subscriptionId: text("subscription_id")
      .notNull()
      .references(() => razorpaySubscriptions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount"),
    currency: text("currency"),
    status: text("status"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("razorpay_payments_subscription_idx").on(t.subscriptionId)]
);

export const razorpayWebhookEvents = pgTable("razorpay_webhook_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  subscriptionId: text("subscription_id"),
  paymentId: text("payment_id"),
  eventCreatedAt: timestamp("event_created_at"),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});

export const extensionConnections = pgTable(
  "extension_connections",
  {
    id: text("id").primaryKey(),
    userCodeHash: text("user_code_hash").notNull(),
    pollSecretHash: text("poll_secret_hash").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    approvedAt: timestamp("approved_at"),
    consumedAt: timestamp("consumed_at"),
  },
  (t) => [
    uniqueIndex("extension_connections_user_code_idx").on(t.userCodeHash),
    index("extension_connections_expiry_idx").on(t.expiresAt),
  ]
);

export const extensionSessions = pgTable(
  "extension_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  (t) => [
    uniqueIndex("extension_sessions_token_idx").on(t.tokenHash),
    index("extension_sessions_user_idx").on(t.userId),
  ]
);

export type User = typeof users.$inferSelect;
export type Entitlement = typeof entitlements.$inferSelect;
