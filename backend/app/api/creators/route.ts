import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, trackedCreators, tweets, insights } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { fetchUserByUsername, fetchUserTweets } from "@/lib/xapi";
import { generateCreatorInsights } from "@/lib/ai";
import { randomUUID } from "crypto";

// GET /api/creators — list all tracked creators with latest insights
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tracked = await db.query.trackedCreators.findMany({
    where: eq(trackedCreators.userId, session.user.id),
  });

  const creatorsWithInsights = await Promise.all(
    tracked.map(async (creator) => {
      const latestInsight = await db.query.insights.findFirst({
        where: eq(insights.creatorXId, creator.creatorXId),
        orderBy: (ins, { desc }) => [desc(ins.generatedAt)],
      });

      return {
        ...creator,
        insight: latestInsight ?? null,
      };
    })
  );

  return NextResponse.json(creatorsWithInsights);
}

// POST /api/creators — add a creator to track
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { username } = body as { username: string };

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Check limit (max 5 creators for now)
  const existingCount = await db.query.trackedCreators.findMany({
    where: eq(trackedCreators.userId, session.user.id),
  });
  if (existingCount.length >= 5) {
    return NextResponse.json(
      { error: "Max 5 tracked creators in this version" },
      { status: 400 }
    );
  }

  // Fetch creator profile via twitterapi.io (no user token needed)
  const xUser = await fetchUserByUsername(username.replace("@", ""));
  if (!xUser) {
    return NextResponse.json({ error: "Creator not found on X" }, { status: 404 });
  }

  // Check if already tracked
  const alreadyTracked = await db.query.trackedCreators.findFirst({
    where: and(
      eq(trackedCreators.userId, session.user.id),
      eq(trackedCreators.creatorXId, xUser.id)
    ),
  });
  if (alreadyTracked) {
    return NextResponse.json({ error: "Already tracking this creator" }, { status: 400 });
  }

  // Insert tracked creator
  await db.insert(trackedCreators).values({
    userId: session.user.id,
    creatorXId: xUser.id,
    creatorUsername: xUser.userName,
    creatorDisplayName: xUser.name,
    creatorProfileImage: xUser.profilePicture ?? null,
    creatorFollowersCount: xUser.followers ?? 0,
  });

  // Kick off tweet fetch + insight generation in background (fire and forget)
  fetchAndCacheCreatorTweets(xUser.userName);

  return NextResponse.json({
    success: true,
    creator: {
      xId: xUser.id,
      username: xUser.userName,
      displayName: xUser.name,
      profileImage: xUser.profilePicture,
      followersCount: xUser.followers ?? 0,
    },
  });
}

// DELETE /api/creators?xId=... — remove a tracked creator
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const xId = req.nextUrl.searchParams.get("xId");
  if (!xId) {
    return NextResponse.json({ error: "xId required" }, { status: 400 });
  }

  await db
    .delete(trackedCreators)
    .where(
      and(
        eq(trackedCreators.userId, session.user.id),
        eq(trackedCreators.creatorXId, xId)
      )
    );

  return NextResponse.json({ success: true });
}

async function fetchAndCacheCreatorTweets(creatorUsername: string) {
  try {
    const fetchedTweets = await fetchUserTweets(creatorUsername, 100);
    if (fetchedTweets.length === 0) return;

    // Resolve creator X id from first tweet's author or re-fetch user info
    const userInfo = await fetchUserByUsername(creatorUsername);
    if (!userInfo) return;
    const creatorXId = userInfo.id;

    // Upsert tweets into cache
    for (const tweet of fetchedTweets) {
      await db
        .insert(tweets)
        .values({
          id: tweet.id,
          authorXId: creatorXId,
          authorUsername: creatorUsername,
          text: tweet.text,
          likeCount: tweet.likeCount ?? 0,
          replyCount: tweet.replyCount ?? 0,
          retweetCount: tweet.retweetCount ?? 0,
          bookmarkCount: tweet.bookmarkCount ?? 0,
          impressionCount: tweet.viewCount ?? 0,
          tweetedAt: new Date(tweet.createdAt),
        })
        .onConflictDoUpdate({
          target: tweets.id,
          set: {
            likeCount: tweet.likeCount ?? 0,
            replyCount: tweet.replyCount ?? 0,
            retweetCount: tweet.retweetCount ?? 0,
            fetchedAt: new Date(),
          },
        });
    }

    // Generate insights from cached tweets
    const dbTweets = await db
      .select()
      .from(tweets)
      .where(eq(tweets.authorXId, creatorXId));

    const insight = await generateCreatorInsights(dbTweets, creatorUsername);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    await db.insert(insights).values({
      id: randomUUID(),
      creatorXId,
      weekStart,
      topTweets: insight.topTweets,
      topics: insight.topics,
      patterns: insight.patterns,
      postingFrequency: insight.postingFrequency,
      summary: insight.summary,
    });
  } catch (err) {
    console.error("Error fetching/caching creator tweets:", err);
  }
}
