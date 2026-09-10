import {
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
