import { NextRequest, NextResponse } from "next/server";
import { extractRecentTopics } from "@/lib/ai";
import { fetchUserTweets } from "@/lib/xapi";

const WINDOW_DAYS = 7;
const REPLY_WINDOW_HOURS = 48;
const MAX_RANKED_POSTS = 8;

function recencyMultiplier(ageInHours: number) {
  if (ageInHours < 6) return 1.0;
  if (ageInHours < 24) return 0.6;
  if (ageInHours <= REPLY_WINDOW_HOURS) return 0.2;
  return 0;
}

function rankRecentPosts<T extends {
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  createdAt: string;
}>(posts: T[], now: Date) {
  return posts
    .map((post) => {
      const traction = post.likeCount + 2 * post.retweetCount + 3 * post.replyCount;
      const ageInHours = Math.max(
        0,
        (now.getTime() - new Date(post.createdAt).getTime()) / (60 * 60 * 1000)
      );
      const multiplier = recencyMultiplier(ageInHours);
      return { post, score: traction * multiplier, eligible: multiplier > 0 };
    })
    .filter(({ eligible }) => eligible)
    .sort((a, b) =>
      b.score - a.score ||
      new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime()
    )
    .slice(0, MAX_RANKED_POSTS)
    .map(({ post }) => post);
}

// GET /api/v0/creator/topics?username=xxx
// Fetches a seven-day timeline but ranks only reply opportunities from the last 48 hours.
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.replace("@", "").trim();

  if (!username) {
    return NextResponse.json({ error: "username query param required" }, { status: 400 });
  }

  try {
    const now = new Date();
    const from = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const fetched = await fetchUserTweets(username, 100);
    const recentPosts = fetched
      .filter((post) => !post.isReply && new Date(post.createdAt) >= from)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const replyFrom = new Date(now.getTime() - REPLY_WINDOW_HOURS * 60 * 60 * 1000);
    const eligiblePostCount = recentPosts.filter((post) => new Date(post.createdAt) >= replyFrom).length;
    const rankedPosts = rankRecentPosts(recentPosts, now);

    const topics = await extractRecentTopics(
      rankedPosts.map((post) => ({
        id: post.id,
        text: post.text,
        likeCount: post.likeCount,
        retweetCount: post.retweetCount,
        replyCount: post.replyCount,
        tweetedAt: post.createdAt,
      })),
      username
    );

    return NextResponse.json({
      username,
      topics,
      postCount: eligiblePostCount,
      from: replyFrom.toISOString(),
      to: now.toISOString(),
    });
  } catch (error) {
    console.error("v0 creator topics error:", error);
    return NextResponse.json({ error: "Failed to fetch recent topics" }, { status: 500 });
  }
}
