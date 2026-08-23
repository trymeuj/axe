import { NextRequest, NextResponse } from "next/server";
import { fetchOwnStats } from "@/lib/xapi";

// Public (auth-less): GET /api/v0/user/stats?username=xxx
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")?.replace("@", "");
  if (!username) {
    return NextResponse.json(
      { error: "username query param required" },
      { status: 400 }
    );
  }

  try {
    const stats = await fetchOwnStats(username);
    if (!stats.user) {
      return NextResponse.json({ error: "User not found on X" }, { status: 404 });
    }

    return NextResponse.json({
      username: stats.user.userName,
      displayName: stats.user.name,
      profileImage: stats.user.profilePicture,
      followersCount: stats.user.followers ?? 0,
      followingCount: stats.user.following ?? 0,
      tweetCount: stats.user.statusesCount ?? 0,
      recentTweets: (stats.recentTweets ?? []).slice(0, 5).map((t) => ({
        id: t.id,
        text: t.text,
        likes: t.likeCount ?? 0,
        replies: t.replyCount ?? 0,
        retweets: t.retweetCount ?? 0,
        createdAt: t.createdAt,
      })),
      avgEngagement: 0, // auth-less: no cached tweets for avg calc
    });
  } catch (err) {
    console.error("v0 user stats error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
