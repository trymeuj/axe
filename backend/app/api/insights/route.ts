import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { insights, trackedCreators, tweets } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/insights?creatorXId=... — get latest insight for a creator
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creatorXId = req.nextUrl.searchParams.get("creatorXId");
  if (!creatorXId) {
    return NextResponse.json({ error: "creatorXId required" }, { status: 400 });
  }

  // Verify user tracks this creator
  const isTracked = await db.query.trackedCreators.findFirst({
    where: and(
      eq(trackedCreators.userId, session.user.id),
      eq(trackedCreators.creatorXId, creatorXId)
    ),
  });

  if (!isTracked) {
    return NextResponse.json({ error: "Creator not tracked" }, { status: 403 });
  }

  const latestInsight = await db.query.insights.findFirst({
    where: eq(insights.creatorXId, creatorXId),
    orderBy: [desc(insights.generatedAt)],
  });

  if (!latestInsight) {
    return NextResponse.json({ status: "pending", message: "Insights are being generated, check back in a moment." });
  }

  // Also return top tweets with full text
  const topTweetIds = (latestInsight.topTweets ?? []).map((t) => t.id);
  const topTweetsFromDb = await db
    .select()
    .from(tweets)
    .where(eq(tweets.authorXId, creatorXId))
    .orderBy(desc(tweets.likeCount))
    .limit(5);

  return NextResponse.json({
    ...latestInsight,
    topTweets: topTweetsFromDb.map((t) => ({
      id: t.id,
      text: t.text,
      likeCount: t.likeCount,
      replyCount: t.replyCount,
      tweetedAt: t.tweetedAt,
    })),
    generatedAt: latestInsight.generatedAt,
  });
}
