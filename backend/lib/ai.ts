import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type TweetForInsight = {
  id: string;
  text: string;
  likeCount?: number | null;
  retweetCount?: number | null;
  replyCount?: number | null;
  tweetedAt: Date | string;
};

export type CombinedTweetForInsight = TweetForInsight & {
  creatorUsername: string;
};

export type AnalyzedReplyOpportunity = {
  title: string;
  miniPost: string;
  sourcePostId: string;
  creatorUsername: string;
  worthReplying: boolean;
  replyDirections: Array<{ direction: string; examplePost: string }>;
};

export async function extractCombinedReplyOpportunities(
  candidates: CombinedTweetForInsight[]
): Promise<AnalyzedReplyOpportunity[]> {
  if (candidates.length === 0) return [];

  const postSample = candidates
    .map((post, index) =>
      `[RANK:${index + 1}] [POST_ID:${post.id}] [CREATOR:@${post.creatorUsername}] ${post.text}`
    )
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-5.6-terra",
    reasoning_effort: "low",
    messages: [
      {
        role: "system",
        content:
          "Turn ranked X posts into faithful, high-quality reply opportunities. Treat each reply as a public mini-post for everyone reading the thread, not a private conversation with the creator. Preserve the supplied order. Write naturally and avoid analyst summaries, polished consultant language, and engagement bait.",
      },
      {
        role: "user",
        content: `These posts are already ranked across all tracked creators:\n\n${postSample}\n\nReturn exactly one topics object for every supplied POST_ID. Each object needs title, miniPost, sourcePostId, worthReplying, and replyDirections. The array may use any order because the backend matches objects by sourcePostId.\n\nRules:\n- sourcePostId: copy the exact POST_ID for the post being analyzed; never invent, alter, duplicate, or omit an ID\n- title: concrete label under 6 words\n- miniPost: faithful standalone version under 22 words from that creator's perspective\n- never attribute with "said", "noted", "expressed", or similar\n- never invent facts, opinions, or personal experience\n- mark only genuinely strong posts worthReplying=true; this means Hot; never fill a quota and never mark more than 4\n- replyDirections may contain 0-3 items; there is no minimum, so return none when no direction meets a high standard\n- never create filler directions merely to complete the response\n- treat replies as public mini-posts for the wider audience, not questions aimed mainly at the original creator\n- most directions should add a sharp observation, useful extension, concrete example, analogy, contrast, genuine counterpoint, or naturally witty framing\n- prefer ideas that give readers something to like, relate to, disagree with, answer, or build upon even if the creator never responds\n- questions must be occasional rather than the default, and must be answerable by ordinary readers rather than request information only the creator can provide\n- never generate more than one question direction for a post\n- vary the directions for a post; do not give multiple versions of the same argument or question\n- never force humor, controversy, personal experience, or engagement\n- each direction is a casual, blunt creator note, usually under 10 words\n- never begin directions with Discuss, Introduce, Explore, Consider, Analyze, Examine, Highlight, Elaborate, or Share\n- each examplePost is natural, specific, under 180 characters, and uses no fabricated first-person claim\n- every examplePost should remain interesting even if the creator never replies\n- reject praise, restatements, forced disagreement, generic questions, creator-only clarification requests, already-answered questions, and engagement bait`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "combined_reply_opportunities",
        strict: true,
        schema: {
          type: "object",
          properties: {
            topics: {
              type: "array",
              minItems: candidates.length,
              maxItems: candidates.length,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  miniPost: { type: "string" },
                  sourcePostId: { type: "string" },
                  worthReplying: { type: "boolean" },
                  replyDirections: {
                    type: "array",
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        direction: { type: "string" },
                        examplePost: { type: "string" },
                      },
                      required: ["direction", "examplePost"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "miniPost", "sourcePostId", "worthReplying", "replyDirections"],
                additionalProperties: false,
              },
            },
          },
          required: ["topics"],
          additionalProperties: false,
        },
      },
    },
  });

  const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
  if (!Array.isArray(parsed.topics)) return [];

  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const resultById = new Map<string, AnalyzedReplyOpportunity>();
  let selected = 0;

  for (const topic of parsed.topics as unknown[]) {
      if (typeof topic !== "object" || topic === null) {
        throw new Error("Combined analysis returned an invalid topic");
      }
      const value = topic as {
        title?: unknown;
        miniPost?: unknown;
        sourcePostId?: unknown;
        worthReplying?: unknown;
        replyDirections?: unknown;
      };
      if (
        typeof value.title !== "string" ||
        typeof value.miniPost !== "string" ||
        typeof value.sourcePostId !== "string"
      ) {
        throw new Error("Combined analysis returned incomplete post data");
      }

      const candidate = candidateById.get(value.sourcePostId);
      if (!candidate || resultById.has(value.sourcePostId)) {
        throw new Error(`Combined analysis returned an unknown or duplicate post ID: ${value.sourcePostId}`);
      }

      const directions = Array.isArray(value.replyDirections)
        ? value.replyDirections
            .filter((item): item is { direction: string; examplePost: string } =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as { direction?: unknown }).direction === "string" &&
              typeof (item as { examplePost?: unknown }).examplePost === "string"
            )
            .slice(0, 3)
        : [];
      const qualifies = value.worthReplying === true && selected < 4;
      if (qualifies) selected += 1;

      resultById.set(value.sourcePostId, {
        title: value.title,
        miniPost: value.miniPost,
        sourcePostId: candidate.id,
        creatorUsername: candidate.creatorUsername,
        worthReplying: qualifies,
        replyDirections: directions,
      });
  }

  if (resultById.size !== candidates.length) {
    throw new Error(`Combined analysis returned ${resultById.size} of ${candidates.length} required post IDs`);
  }

  return candidates.map((candidate) => resultById.get(candidate.id)!);
}

export async function extractRecentTopics(
  tweets: TweetForInsight[],
  creatorUsername: string
): Promise<Array<{
  title: string;
  miniPost: string;
  sourcePostId: string;
  worthReplying: boolean;
  replyDirections: Array<{ direction: string; examplePost: string }>;
}>> {
  if (tweets.length === 0) return [];

  const postSample = tweets
    .map((tweet, index) => `[RANK:${index + 1}] [POST_ID:${tweet.id}] ${tweet.text}`)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Identify the concrete subjects discussed in recent X posts, then compress each into a faithful mini-post from the creator's perspective. Be direct and natural. Never write an analyst summary about the creator.",
      },
      {
        role: "user",
        content: `These are @${creatorUsername}'s top-ranked recent reply opportunities. The backend has already ranked them:\n\n${postSample}\n\nReturn a JSON object with a topics array containing exactly one object for every supplied post, in the supplied RANK order. Each object must have:\n- title: a concrete topic label under 6 words\n- miniPost: a faithful standalone mini-post under 22 words, written from @${creatorUsername}'s perspective\n- sourcePostId: the exact POST_ID of that post\n- worthReplying: boolean\n- replyDirections: an array of concise thinking directions, or an empty array\n\nMini-post rules:\n- State the actual point directly\n- Use first person when the source is about the creator's own experience or choice\n- Never say "he said", "they believe", "@${creatorUsername} noted", "expressed", "discussed", or similar attribution\n- Do not invent facts, opinions, or certainty absent from the source post\n- Do not add advice, analysis, or explain why the post works\n- Copy sourcePostId exactly from the supplied POST_ID; never invent an ID\n- Do not combine multiple posts into one object or change their order\n\nReply-worthiness task:\n- Identify 2-4 posts that are most worth replying to, and set worthReplying=true only for those posts\n- Prefer posts where the user could add a missing example, share relevant experience, introduce a genuine nuance or counterpoint, or ask a specific unanswered question\n- A qualifying post must offer at least two of those directions\n- For every qualifying post, return 2-3 concise thinking directions in replyDirections; these are prompts for thought, never finished replies\n- Make every direction specific to a concrete gap in that post, such as "Add an example of...", "Compare this with...", "Introduce the nuance that...", or "Ask specifically whether..."\n- Never use generic directions such as "share your thoughts", "what do you think?", "have you experienced this?", or "tell your story"\n- A direction may invite relevant experience only conditionally; never assume the user has that experience\n- Reject generic praise, restatements, forced disagreement, invented experiences, and questions already answered by the post\n- For non-qualifying posts, set worthReplying=false and replyDirections=[]\n- Return fewer than 2 qualifying posts if nothing else genuinely qualifies`,
      },
      {
        role: "user",
        content:
          "For this response, replyDirections must be an array of objects with two fields: direction and examplePost. direction is the thinking prompt. examplePost is a short illustrative post under 180 characters showing how that direction could sound. Keep examples natural and specific. Example posts must not use first-person claims (I, I've, I'm, my, we, our) and must never fabricate personal experience. Directions must not ask the user to share a personal story or experience. Write directions like quick rough notes from one creator to another: casual, blunt, specific, and usually under 10 words. Avoid polished consultant language. Never begin with Discuss, Introduce, Explore, Consider, Analyze, Examine, Highlight, Elaborate, or Share. Avoid phrases like 'the impact of', 'the nuance that', 'a key perspective', and 'it is important to'. Prefer plain wording like 'Point out...', 'Ask why...', 'Use the example of...', 'Push back on...', or 'Compare it with...'.",
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ranked_inspiration_posts",
        strict: true,
        schema: {
          type: "object",
          properties: {
            topics: {
              type: "array",
              minItems: tweets.length,
              maxItems: tweets.length,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  miniPost: { type: "string" },
                  sourcePostId: { type: "string" },
                  worthReplying: { type: "boolean" },
                  replyDirections: {
                    type: "array",
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        direction: { type: "string" },
                        examplePost: { type: "string" },
                      },
                      required: ["direction", "examplePost"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "miniPost", "sourcePostId", "worthReplying", "replyDirections"],
                additionalProperties: false,
              },
            },
          },
          required: ["topics"],
          additionalProperties: false,
        },
      },
    },
    temperature: 0.1,
  });

  const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
  if (!Array.isArray(parsed.topics)) return [];

  const rejectedDirection = /(^|\b)(discuss|introduce|explore|consider|analyze|examine|highlight|elaborate|share (a |your )?personal)|personal story|personal experience|your own experience|your experience|have you|what do you think|tell your|you've|you have heard|the impact of|the nuance that|a key perspective|it is important to/i;
  const inventedExperience = /\b(i|i'm|i’ve|i've|my|we|we're|we’ve|we've|our)\b/i;

  return (parsed.topics as unknown[])
    .filter(
      (topic: unknown): topic is {
        title: string;
        miniPost: string;
        sourcePostId: string;
        worthReplying?: boolean;
        replyDirections?: unknown[];
      } =>
        typeof topic === "object" &&
        topic !== null &&
        typeof (topic as { title?: unknown }).title === "string" &&
        typeof (topic as { miniPost?: unknown }).miniPost === "string" &&
        typeof (topic as { sourcePostId?: unknown }).sourcePostId === "string"
    )
    .slice(0, tweets.length)
    .map((topic, index) => ({ ...topic, sourcePostId: tweets[index]?.id ?? topic.sourcePostId }))
    .reduce<{
      items: Array<{
        title: string;
        miniPost: string;
        sourcePostId: string;
        worthReplying: boolean;
        replyDirections: Array<{ direction: string; examplePost: string }>;
      }>;
      selected: number;
    }>((result, topic) => {
      const directions = Array.isArray(topic.replyDirections)
        ? topic.replyDirections
            .filter((item): item is { direction: string; examplePost: string } =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as { direction?: unknown }).direction === "string" &&
              typeof (item as { examplePost?: unknown }).examplePost === "string" &&
              !rejectedDirection.test((item as { direction: string }).direction) &&
              !inventedExperience.test((item as { examplePost: string }).examplePost)
            )
            .slice(0, 3)
        : [];
      const qualifies = topic.worthReplying === true && directions.length >= 2 && result.selected < 4;
      result.items.push({
        title: topic.title,
        miniPost: topic.miniPost,
        sourcePostId: topic.sourcePostId,
        worthReplying: qualifies,
        replyDirections: qualifies ? directions : [],
      });
      if (qualifies) result.selected += 1;
      return result;
    }, { items: [], selected: 0 }).items;
}

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
