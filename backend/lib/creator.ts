import { fetchUserByUsername, fetchUserTweets } from "@/lib/xapi";
import { generateCreatorInsights } from "@/lib/ai";
import type { XTweet } from "@/lib/xapi";

/**
 * Fetches creator tweets, generates insights. No DB — returns data for extension to store in localStorage.
 */
export async function fetchCreatorInsights(creatorUsername: string) {
  const username = creatorUsername.replace("@", "");
  const xUser = await fetchUserByUsername(username);
  if (!xUser) return null;

  const fetchedTweets = await fetchUserTweets(username, 100);
  if (fetchedTweets.length === 0) {
    return { user: xUser, insight: null };
  }

  const forInsight = fetchedTweets.map((t: XTweet) => ({
    id: t.id,
    text: t.text,
    likeCount: t.likeCount ?? 0,
    replyCount: t.replyCount ?? 0,
    tweetedAt: new Date(t.createdAt),
  }));

  const insight = await generateCreatorInsights(forInsight, username);

  const topTweets = [...fetchedTweets]
    .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      text: t.text,
      likeCount: t.likeCount ?? 0,
      replyCount: t.replyCount ?? 0,
      tweetedAt: t.createdAt,
    }));

  return {
    user: xUser,
    insight: {
      ...insight,
      topTweets,
      generatedAt: new Date().toISOString(),
    },
  };
}
