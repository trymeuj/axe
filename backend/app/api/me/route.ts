import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, tweets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { fetchOwnStats } from "@/lib/xapi";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch fresh stats via twitterapi.io (no user token needed)
  const stats = await fetchOwnStats(user.xUsername);

  // Get cached tweet performance for avg engagement calc
  const recentCachedTweets = await db
    .select()
    .from(tweets)
    .where(eq(tweets.authorXId, user.xId))
    .orderBy(desc(tweets.tweetedAt))
    .limit(20);

  const avgEngagement =
    recentCachedTweets.length > 0
      ? recentCachedTweets.reduce(
          (sum, t) =>
            sum + (t.likeCount ?? 0) + (t.replyCount ?? 0) + (t.retweetCount ?? 0),
          0
        ) / recentCachedTweets.length
      : 0;

  return NextResponse.json({
    username: user.xUsername,
    displayName: user.xDisplayName,
    profileImage: user.xProfileImage,
    followersCount: stats.user?.followers ?? user.followersCount,
    followingCount: stats.user?.following ?? 0,
    tweetCount: stats.user?.statusesCount ?? 0,
    recentTweets: stats.recentTweets.slice(0, 5).map((t) => ({
      id: t.id,
      text: t.text,
      likes: t.likeCount ?? 0,
      replies: t.replyCount ?? 0,
      retweets: t.retweetCount ?? 0,
      createdAt: t.createdAt,
    })),
    avgEngagement: Math.round(avgEngagement),
  });
}
