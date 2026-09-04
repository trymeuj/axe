import { NextRequest, NextResponse } from "next/server";
import { extractCombinedReplyOpportunities, type CombinedTweetForInsight } from "@/lib/ai";
import { fetchUserTweets, type XTweet } from "@/lib/xapi";

const FETCH_WINDOW_DAYS = 7;
const REPLY_WINDOW_HOURS = 48;
const CANDIDATES_PER_CREATOR = 8;
const VISIBLE_POSTS = 20;

type RankedCandidate = CombinedTweetForInsight & { score: number };

function recencyMultiplier(ageInHours: number) {
  if (ageInHours < 6) return 1.0;
  if (ageInHours < 24) return 0.6;
  if (ageInHours <= REPLY_WINDOW_HOURS) return 0.2;
  return 0;
}

function rankCreatorPosts(posts: XTweet[], creatorUsername: string, now: Date): RankedCandidate[] {
  const fetchedFrom = now.getTime() - FETCH_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return posts
    .filter((post) => !post.isReply && !post.retweeted_tweet && new Date(post.createdAt).getTime() >= fetchedFrom)
    .map((post) => {
      const ageInHours = Math.max(0, (now.getTime() - new Date(post.createdAt).getTime()) / 3_600_000);
      const multiplier = recencyMultiplier(ageInHours);
      const traction = post.likeCount + 2 * post.retweetCount + 3 * post.replyCount;
      return {
        id: post.id,
        text: post.text,
        likeCount: post.likeCount,
        retweetCount: post.retweetCount,
        replyCount: post.replyCount,
        tweetedAt: post.createdAt,
        creatorUsername,
        score: traction * multiplier,
        eligible: multiplier > 0,
      };
    })
    .filter((post) => post.eligible)
    .sort((a, b) =>
      b.score - a.score || new Date(b.tweetedAt).getTime() - new Date(a.tweetedAt).getTime()
    )
    .slice(0, CANDIDATES_PER_CREATOR)
    .map(({ eligible: _eligible, ...post }) => post);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { usernames?: unknown };
    const usernames = Array.isArray(body.usernames)
      ? [...new Set(body.usernames
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.replace("@", "").trim())
          .filter(Boolean))]
      : [];

    if (usernames.length === 0) {
      return NextResponse.json({ error: "At least one creator is required" }, { status: 400 });
    }

    const now = new Date();
    const fetched = await Promise.allSettled(
      usernames.map(async (username) => ({ username, posts: await fetchUserTweets(username, 100) }))
    );
    const failedCreators: string[] = [];
    const candidates = fetched.flatMap((result, index) => {
      if (result.status === "rejected") {
        failedCreators.push(usernames[index]);
        return [];
      }
      return rankCreatorPosts(result.value.posts, result.value.username, now);
    });

    if (failedCreators.length === usernames.length) {
      return NextResponse.json(
        { error: "Could not fetch posts from any tracked creator" },
        { status: 502 }
      );
    }

    const uniqueCandidates = [...new Map(candidates.map((candidate) => [candidate.id, candidate])).values()];
    if (uniqueCandidates.length !== candidates.length) {
      console.warn("v0 discovery removed duplicate candidate IDs", {
        supplied: candidates.length,
        unique: uniqueCandidates.length,
      });
    }

    uniqueCandidates.sort((a, b) =>
      b.score - a.score || new Date(b.tweetedAt).getTime() - new Date(a.tweetedAt).getTime()
    );

    const candidatesForAnalysis = uniqueCandidates.slice(0, VISIBLE_POSTS);
    const analyzed = await extractCombinedReplyOpportunities(candidatesForAnalysis);

    return NextResponse.json({
      posts: analyzed,
      candidateCount: uniqueCandidates.length,
      creatorCount: usernames.length,
      failedCreators,
      refreshedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("v0 combined post discovery error:", error);
    return NextResponse.json({ error: "Failed to find reply opportunities" }, { status: 500 });
  }
}
