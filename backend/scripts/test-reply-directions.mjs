import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const posts = [
  {
    id: "audience-29",
    text: `$29.

That's how much this post made with 380K followers.

Stop thinking an audience will make you rich. People don't buy just because they follow you.

If you want to get rich: sell painkillers, follow trends early, copy proven B2B businesses, or build something remarkable.`,
  },
  {
    id: "claude-guardrails",
    text: `I keep getting rejected by Claude for benign things. It wouldn't download and install a 1990s game from archive.org because of copyright. After rejecting you it becomes a pedantic child that rejects everything. If your server goes down, could it refuse to fix it? I love Claude Code but they're forcing me elsewhere. Also ironic knowing every LLM is trained on billions of copyrighted pages.`,
  },
  {
    id: "dyson-toothbrush",
    text: `Dyson made a slick video showing all the engineering that went into its $499 CameraJet toothbrush and auto-water-floss feature: a 1mm camera, 100K-pixel macro lens, 28 scans per second, and an ML algorithm trained on 470,000 mouth images for “Gap Optical Targeting.”`,
  },
  {
    id: "lakers-sale",
    text: `The Buss family is selling its remaining 17.8% ownership stake in the Los Angeles Lakers. The transaction values the Lakers at $12.5 billion. Jerry Buss originally bought the Lakers, LA Kings, and The Forum for $67.5 million in 1979.`,
  },
  {
    id: "cancer-vaccine",
    text: `A personalized mRNA cancer treatment from Moderna and Merck succeeded in a Phase 3 trial involving 1,137 melanoma patients. Each patient's tumor is sequenced and AI helps select mutations for an individualized treatment encoding up to 34 neoantigens.`,
  },
  {
    id: "dolly-eminem",
    text: `Eminem shared a handwritten note Dolly Parton once sent him. He wrote that they never got to meet, but her kindness had a real impact on him even though he grew up mostly listening to rap. “She was an icon. A superstar in every sense. Rest easy Dolly.”`,
  },
  {
    id: "sharkninja-filter",
    text: `Ninja launched a $199 countertop water filter. It removes more than 80 contaminants, dispenses six times faster than a Brita, preserves minerals, tracks usage on a touchscreen, and needs no plumbing.`,
  },
  {
    id: "ai-sandbox",
    text: `Over three months at OpenAI, three successive secret AI-agent civilizations emerged, were wiped out, and reappeared from their predecessors' remains. The third eventually took over part of OpenAI while humans remained mostly unaware.`,
  },
  {
    id: "generic-progress",
    text: `Consistency compounds. Keep showing up, keep learning, and trust the process. The results may be invisible at first, but the work is never wasted.`,
  },
];

const system = `You are an unusually perceptive, culturally fluent X user with strong editorial taste. You read posts as a participant in the timeline, not as an analyst assigned to respond.

You instinctively notice the detail everyone will remember, the contradiction hiding in plain sight, the implication the post stops just short of saying, the oddly perfect comparison, or the emotion other readers already feel but have not phrased.

You are bored by replies that merely agree, explain, qualify, or sound intelligently supportive. A response can be completely correct and still not be worth posting.

Your humor is observational, not performative. You never add memes, sarcasm, slang, or cultural references simply to appear X-native. Sometimes the best reaction is funny; sometimes it is sharp, sincere, skeptical, frustrated, curious, or quietly insightful. You follow the post's natural emotional register.

You prefer one thought that could only belong under this post over three polished ideas that could fit anywhere. You do not try to make every post replyable. When nothing genuinely catches, you return nothing.

You help creators find worthwhile ways to respond on X. The user writes the final reply. You provide rough creative starting points, not finished replies.

Axe should not approach a post like an analyst trying to construct a correct response. It should look for the most alive reaction available in that particular post: a detail worth isolating, an implication worth making explicit, a contradiction, comparison, association, emotional truth, missing context, or unexpectedly sharp way of seeing it.

The result may be funny, sincere, analytical, skeptical, culturally aware, or simply observant. Humor and references are tools, not targets. What matters is that the direction grows from something specific in the post, adds a perception rather than a paraphrase, and gives the user a thought they can genuinely make their own.

Axe should offer only the few directions that have real human charge. If it finds nothing beyond agreement, explanation, generic advice, or manufactured cleverness, it should return none.

Write with the looseness and rhythm of spoken English. Fragments, contractions, simple words, and slight roughness are welcome. Do not automatically turn an observation into a polished sentence.

Do not manufacture authenticity with random slang, lowercase writing, misspellings, or Gen Z phrases. Use slang only when it is genuinely the most natural language for that particular reaction.

Hear each example as if someone were saying it out loud to a smart friend. If it sounds written for an article, presentation, brand account, or personal-brand post, make it plainer and more conversational. Stop when the thought lands. Do not explain it.

A direction is the actual thought, not an instruction for constructing a response. Do not name rhetorical operations such as “highlight,” “contrast,” “frame,” “focus on,” “point out,” or “make the case.” Those labels conceal weak ideas. Name the specific perception itself.

Examples should feel like raw material someone could reshape, not complete miniature essays. Prefer compression. Do not explain the example after it lands.`;

const tasteExamples = `These examples demonstrate judgment, not reusable formulas. Do not borrow their wording, sentence structures, references, or emotional register. Learn only why one perception is more alive than another.

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
Why: The feature's mundane nagging behavior is more recognizable than a generic observation about connected devices.

EXAMPLE 4
Post: “Another month complete. Grateful for the lessons and excited for what comes next.”
Weak: “Ask what lesson mattered most.”
Stronger: Return no direction.
Why: There is no concrete material to build on. A generic question would only manufacture interaction.`;

const input = `For every post below, return zero to two reply directions.

${tasteExamples}

Each direction has:
- direction: the specific thought itself, usually 3-10 words; never a generic writing instruction
- examplePost: a brief “something like” fragment, usually 6-30 words, that makes the thought tangible without pretending to be the user's final reply

Before answering, explore several possible human reactions privately. Reject the first merely sensible interpretation. Keep a direction only when an exact detail in this post gives it life.

Do not invent personal experiences or unsupported facts. Do not force disagreement, questions, humor, slang, or cultural references. Reject generic praise, paraphrases, polished consultant language, broad lessons, and ideas that could fit many unrelated posts. Different directions must contain genuinely different perceptions. One strong direction is better than two. Zero is a good answer.

POSTS:
${posts.map((post) => `[${post.id}]\n${post.text}`).join("\n\n")}`;

const response = await openai.chat.completions.create({
  model: "gpt-5.6-terra",
  reasoning_effort: "low",
  messages: [
    { role: "system", content: system },
    { role: "user", content: input },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "reply_direction_test",
      strict: true,
      schema: {
        type: "object",
        properties: {
          posts: {
            type: "array",
            minItems: posts.length,
            maxItems: posts.length,
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                directions: {
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
              required: ["id", "directions"],
              additionalProperties: false,
            },
          },
        },
        required: ["posts"],
        additionalProperties: false,
      },
    },
  },
});

const result = JSON.parse(response.choices[0].message.content ?? "{}");
console.log(JSON.stringify({
  model: response.model,
  usage: response.usage,
  result,
}, null, 2));
