import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type TweetForInsight = {
  id: string;
  text: string;
  likeCount?: number | null;
  replyCount?: number | null;
  tweetedAt: Date | string;
};

export type CreatorInsight = {
  topics: string[];
  patterns: string[];
  postingFrequency: string;
  summary: string;
  topTweets: Array<{
    id: string;
    text: string;
    likeCount: number;
    replyCount: number;
    tweetedAt: string;
    whyItWorked: string;
  }>;
};

export async function generateCreatorInsights(
  tweets: TweetForInsight[],
  creatorUsername: string
): Promise<CreatorInsight> {
  const topTweets = [...tweets]
    .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
    .slice(0, 5);

  const tweetSample = tweets
    .slice(0, 50)
    .map(
      (t) =>
        `[${new Date(t.tweetedAt).toDateString()}] likes:${t.likeCount} replies:${t.replyCount}\n"${t.text}"`
    )
    .join("\n\n");

  console.log("[axe] LLM generateCreatorInsights: starting,", tweets.length, "tweets for @", creatorUsername);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert X (Twitter) growth analyst. Analyze tweets from @${creatorUsername} and extract clear, actionable patterns for a creator who wants to grow like them.`,
      },
      {
        role: "user",
        content: `Analyze these ${tweets.length} recent tweets from @${creatorUsername}:\n\n${tweetSample}\n\nReturn a JSON object with:
- topics: array of 4-6 main topic themes (short labels)
- patterns: array of 3-5 content patterns that work well (specific, actionable observations)
- postingFrequency: string describing their posting cadence
- summary: 2-3 sentence summary of what's working for this creator

Only return valid JSON, no markdown.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
  console.log("[axe] LLM generateCreatorInsights: done");

  return {
    topics: parsed.topics ?? [],
    patterns: parsed.patterns ?? [],
    postingFrequency: parsed.postingFrequency ?? "",
    summary: parsed.summary ?? "",
    topTweets: topTweets.map((t) => ({
      id: t.id,
      text: t.text,
      likeCount: t.likeCount ?? 0,
      replyCount: t.replyCount ?? 0,
      tweetedAt: typeof t.tweetedAt === "string" ? t.tweetedAt : t.tweetedAt.toISOString(),
      whyItWorked: "",
    })),
  };
}

export type ReplyIdea = {
  angle: string;
  exampleReply: string;
  why: string;
};

export async function generateReplyIdeas(
  tweetText: string,
  creatorUsername: string,
  userFollowersCount: number
): Promise<ReplyIdea[]> {
  const stage =
    userFollowersCount < 500
      ? "early-stage creator with under 500 followers"
      : userFollowersCount < 5000
        ? "growing creator with under 5k followers"
        : "established creator";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert X growth coach. You help ${stage}s craft replies that build their audience. Replies should add genuine value, show expertise, and be concise. Never sycophantic.`,
      },
      {
        role: "user",
        content: `@${creatorUsername} posted: "${tweetText}"

Generate 3 distinct reply angles for a ${stage}. Each reply should help them get noticed by @${creatorUsername}'s audience.

Return JSON array of 3 objects with:
- angle: short label for the reply strategy (e.g. "Add a data point", "Share your experience")
- exampleReply: a concrete example reply (max 200 chars, no hashtags)
- why: one sentence on why this reply works for a ${stage}

Only return valid JSON array, no markdown.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
  return parsed.ideas ?? parsed.replies ?? parsed ?? [];
}
