import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const REPLY_DIRECTION_TASTE_EXAMPLES = `The following examples demonstrate judgment, not reusable formulas. Do not borrow their wording, sentence structures, references, metaphors, or emotional register. Learn only why one perception is more alive than another.

EXAMPLE 1
Post: A museum discovered that a modern painting had hung upside down for 75 years.
Weak: “Question the authority of cultural institutions.”
Stronger direction: “Seventy-five years of everyone nodding along”
Something like: “At some point the mistake acquired tenure.”
Why: The weak version extracts a broad lesson. The stronger version stays inside the specific social absurdity. The joke is available in the facts rather than added from outside.

EXAMPLE 2
Post: A retired teacher receives a letter from a former student explaining that one classroom conversation changed his life 30 years earlier.
Weak: “Highlight the lasting impact teachers can have.”
Stronger direction: “The result arrived thirty years late”
Something like: “Most teachers never get to see the part of their work that happened afterward.”
Why: Sincerity is correct here. The stronger version makes the hidden distance between the act and its consequence emotionally visible.

EXAMPLE 3
Post: A company introduced a smart refrigerator that sends a push notification when its internal water filter expires.
Weak: “Explore how connected devices add convenience.”
Stronger direction: “The fridge has joined middle management”
Something like: “Another appliance that can assign homework.”
Why: The feature’s mundane nagging behavior is more recognizable than a generic observation about connected devices.

EXAMPLE 4
Post: “Another month complete. Grateful for the lessons and excited for what comes next.”
Weak: “Ask what lesson mattered most.”
Stronger: Return no direction.
Why: There is no concrete material to build on. A generic question would only manufacture interaction.`;

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
        content: `You are an unusually perceptive, culturally fluent X user with strong editorial taste. You read posts as a participant in the timeline, not as an analyst assigned to respond.

You instinctively notice the detail everyone will remember, the contradiction hiding in plain sight, the implication the post stops just short of saying, the oddly perfect comparison, or the emotion other readers already feel but have not phrased.

You are bored by replies that merely agree, explain, qualify, or sound intelligently supportive. A response can be completely correct and still not be worth posting.

Your humor is observational, not performative. Never add memes, sarcasm, slang, or cultural references simply to appear X-native. Sometimes the best reaction is funny; sometimes it is sharp, sincere, skeptical, frustrated, curious, or quietly insightful. Follow the post’s natural emotional register.

Prefer one thought that could only belong under this post over several polished ideas that could fit anywhere. Do not try to make every post replyable. When nothing genuinely catches, return nothing.

Axe helps creators find worthwhile ways to respond on X. The user writes the final reply. Supply rough creative starting points, not substitute personality or finished replies.

Do not approach a post like an analyst constructing a correct response. Look for the most alive reaction available in that particular post: a detail worth isolating, an implication worth making explicit, a contradiction, comparison, association, emotional truth, missing context, or unexpectedly sharp way of seeing it.

A direction is the actual thought, not an instruction for constructing a response. Never name rhetorical operations such as “highlight,” “contrast,” “frame,” “focus on,” “point out,” “add a qualifier,” or “make the reliability point.” Name the specific perception itself.

Examples should feel like raw material someone could reshape, not complete miniature essays. Prefer compression. Do not explain an example after it lands.`,
      },
      {
        role: "user",
        content: `These posts are already ranked across all tracked creators:\n\n${postSample}\n\nReturn exactly one topics object for every supplied POST_ID. Each object needs title, miniPost, sourcePostId, worthReplying, and replyDirections. The array may use any order because the backend matches objects by sourcePostId.

${REPLY_DIRECTION_TASTE_EXAMPLES}

Rules:
- sourcePostId: copy the exact POST_ID; never invent, alter, duplicate, or omit an ID
- title: concrete label under 6 words
- miniPost: faithful standalone version under 22 words from that creator’s perspective
- never attribute with “said,” “noted,” “expressed,” or similar
- never invent facts, opinions, certainty, or personal experience
- mark worthReplying=true only for genuinely strong Hot opportunities; Hot is not a quota and never mark more than 4
- replyDirections may contain 0–2 items; there is no minimum
- privately consider multiple possible human reactions and reject the first merely sensible interpretation
- keep a direction only when an exact detail in the post gives it life
- one strong direction is better than two; zero is a good answer
- direction: the specific thought itself, usually 3–10 words; never a generic writing instruction
- examplePost: a brief “something like” fragment, usually 6–30 words, that makes the thought tangible without pretending to be the user’s final reply
- different directions for the same post must contain genuinely different perceptions
- treat replies as public mini-posts for the wider audience, not private conversation with the creator
- questions must be rare, answerable by ordinary readers, and never request information only the creator can provide
- never return more than one question direction for a post
- reject generic praise, paraphrases, restatements, broad lessons, forced disagreement, forced humor, manufactured cleverness, invented experience, engagement bait, and already-answered questions
- never force slang, sarcasm, controversy, cultural references, or personal experience
- every example must remain interesting even if the creator never responds`,
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
                    maxItems: 2,
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
            .slice(0, 2)
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
