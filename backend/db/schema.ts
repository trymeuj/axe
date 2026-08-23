import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

// Public-account MVP user profile. No X OAuth tokens are stored.
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  xId: text("x_id").notNull().unique(),
  xUsername: text("x_username").notNull(),
  xDisplayName: text("x_display_name").notNull(),
  xProfileImage: text("x_profile_image"),
  followersCount: integer("followers_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trackedCreators = pgTable(
  "tracked_creators",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creatorXId: text("creator_x_id").notNull(),
    creatorUsername: text("creator_username").notNull(),
    creatorDisplayName: text("creator_display_name").notNull(),
    creatorProfileImage: text("creator_profile_image"),
    creatorFollowersCount: integer("creator_followers_count").default(0),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.creatorXId] }),
    index("tracked_creators_user_idx").on(t.userId),
  ]
);

export const tweets = pgTable(
  "tweets",
  {
    id: text("id").primaryKey(),
    authorXId: text("author_x_id").notNull(),
    authorUsername: text("author_username").notNull(),
    text: text("text").notNull(),
    likeCount: integer("like_count").default(0),
    replyCount: integer("reply_count").default(0),
    retweetCount: integer("retweet_count").default(0),
    bookmarkCount: integer("bookmark_count").default(0),
    impressionCount: integer("impression_count").default(0),
    tweetedAt: timestamp("tweeted_at").notNull(),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (t) => [
    index("tweets_author_idx").on(t.authorXId),
    index("tweets_tweeted_at_idx").on(t.tweetedAt),
  ]
);

export const insights = pgTable(
  "insights",
  {
    id: text("id").primaryKey(),
    creatorXId: text("creator_x_id").notNull(),
    weekStart: timestamp("week_start").notNull(),
    topTweets: jsonb("top_tweets").$type<TweetSummary[]>().default([]),
    topics: jsonb("topics").$type<string[]>().default([]),
    patterns: jsonb("patterns").$type<string[]>().default([]),
    postingFrequency: text("posting_frequency"),
    summary: text("summary"),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
  },
  (t) => [
    index("insights_creator_idx").on(t.creatorXId),
    index("insights_week_idx").on(t.weekStart),
  ]
);

export type TweetSummary = {
  id: string;
  text: string;
  likeCount: number;
  replyCount: number;
  tweetedAt: string;
};

export type User = typeof users.$inferSelect;
export type TrackedCreator = typeof trackedCreators.$inferSelect;
export type Tweet = typeof tweets.$inferSelect;
export type Insight = typeof insights.$inferSelect;
