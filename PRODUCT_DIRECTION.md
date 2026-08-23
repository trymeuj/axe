# Axe Product Direction

Last updated: 2026-08-23

This is the living record of how the founder wants Axe to work. Update it whenever a product assumption, constraint, or decision changes.

Current implementation work is tracked separately in [ACTIVE_TODO.md](./ACTIVE_TODO.md).

## Product purpose

Axe helps creators begin and frame posts using useful patterns from creators they admire. It is not an automatic post generator.

Posting has two problems that Axe should solve:

1. **What should I post about?**
2. **How should I frame the post?**

The user writes the final post. Axe provides topics, angles, questions, bullet points, structural guidance, and short phrase fragments. It should not produce a finished, copy-pasteable draft.

## Current stage and constraints

- Build for personal use first, followed by approximately 10 early users.
- Optimize for usefulness and learning, not scale.
- Manual operations and duplicated creator analysis are acceptable at this stage.
- Do not build real-time monitoring or keep an LLM continuously running.
- Do not add complicated infrastructure until early users demonstrate repeated value.
- The product can evolve later; these principles describe the current MVP.

## Core modes

### Mode 1: Help me find an idea

- The user selects approximately 3–5 creators.
- When the user explicitly requests a refresh, Axe fetches those creators' posts from approximately the previous week.
- Newer posts receive more weight than older posts.
- Other useful signals can include engagement, performance relative to the creator's normal results, repeated themes across creators, novelty, and relevance to the user.
- Axe returns idea cards rather than finished posts.
- Useful output includes topics, why the topic may be interesting, possible personal angles, questions for the user, and framing directions.

### Mode 2: Help me frame an idea

- The user supplies a rough idea, observation, or experience.
- Axe uses the stored writing-pattern analysis of the selected creators.
- It suggests several ways to structure the thought.
- Useful output includes opening mechanisms, point sequences, evidence prompts, tension or contrast, closing directions, and short phrase fragments.
- The user writes the final post.

## Creator analysis

### Stable writing-pattern profile

- Analyze a creator when the user first adds them.
- Treat writing style as mostly static during the MVP.
- No automatic monthly refresh is necessary yet; a manual reanalysis option is sufficient.
- Analyze a representative sample of original posts, with replies, reposts, and repetitive promotions excluded where possible.
- Prefer learning from the creator's stronger posts rather than treating every post equally.
- Store operational patterns, not generic descriptions such as "concise and engaging."
- Examples of useful patterns include how the creator opens, develops an idea, uses evidence or experience, creates contrast, controls sentence rhythm, and closes.

### Selecting top-performing posts

Top posts should be identified using public engagement signals where available:

- Likes
- Replies
- Reposts
- Quotes
- Bookmarks
- Impressions/views

Raw engagement alone is misleading because older posts have had more time to accumulate engagement and large creators naturally receive larger counts. Axe should prefer a relative performance score that considers:

- Engagement compared with that creator's normal post
- Post age
- Impressions when available
- Type of post and whether it is original content

For the MVP, a simple ranking is acceptable. Analyze both a group of top-performing posts and a smaller baseline sample of ordinary posts so the model can identify what is distinctive about the winners.

## User personalization

There are two possible levels.

### Level 1: Public-account personalization

Axe can treat the user like any other public creator and retrieve their public profile, posts, and public engagement metrics. This does not require the user to authorize their X account.

This is sufficient for the first MVP and can help Axe learn:

- Topics the user already discusses
- Their existing writing patterns
- Which public posts performed relatively well
- Topics and formats they may be overusing
- Which creator-inspired suggestions are most relevant to their history

### Level 2: Connected-account personalization

The user signs in with X through OAuth and explicitly authorizes Axe. This can identify the account reliably and unlock private metrics for the user's own recent posts, subject to X API permissions and limits.

Potential additional signals include:

- Link clicks
- Profile clicks
- Total/private engagement metrics
- Organic versus promoted performance
- Access to authorized resources such as bookmarks or home timeline only if the corresponding scopes are deliberately requested

Connected access should use the minimum read-only scopes needed. Axe should not request permission to publish during the MVP.

**Confirmed MVP decision:** use public-account personalization only. Do not add X OAuth yet. Reconsider OAuth only after the ten-user test shows that private metrics or authenticated resources would materially improve recommendations.

## Inspiration creator data

For each selected inspiration creator, Axe should fetch only public information needed to learn topics and useful writing patterns.

### Public creator profile

- Stable X user ID and username
- Display name and biography
- Follower and following counts
- Total post count
- Account creation date
- Profile image for identification in the interface

### Public original posts

- Post ID and full text
- Creation time
- Public likes, replies, reposts, quotes, bookmarks, and impressions/views when available
- Whether the post is a reply, repost, quote, thread component, or standalone original
- Conversation/thread ID and referenced post IDs when available
- Links, hashtags, mentions, and attached media type when useful

### Derived by Axe

- Top-performing posts relative to the creator's normal performance
- Baseline/ordinary posts for comparison
- Recurring and recent topics
- Common opening mechanisms
- Common post structures
- Use of stories, examples, evidence, contrast, lists, questions, and conclusions
- Typical post length and sentence rhythm
- Posting frequency and timing
- Patterns that occur disproportionately in strong posts

### Exclude or reduce weight

- Reposts of other accounts
- Routine replies unless reply-writing is deliberately studied later
- Repetitive promotions and announcements
- Giveaways and obvious engagement bait
- Duplicated or near-duplicated posts
- Posts whose performance is dominated by unrelated virality

For the MVP, fetch approximately 50–100 representative original posts when a creator is added for writing-pattern analysis. For current-topic inspiration, fetch only posts from roughly the previous seven days when the user explicitly refreshes.

## AI behavior rules

- Never default to producing a final post.
- Prefer bounded, structured outputs instead of unrestricted prose.
- Require the user's experience, opinion, evidence, or example to complete the post.
- Explain the underlying structural pattern rather than impersonating a named creator.
- Avoid vague advice and generic labels.
- Do not encourage copying a creator's wording or identity.
- The desired outcome is: "I know what I want to say and how to start," not "I can paste this generated tweet."

## MVP architecture

- Brave/Chrome extension as the main interface inside X.
- Next.js backend for API requests and AI orchestration.
- Neon PostgreSQL provisioned through Vercel for users, creators, creator analyses, refresh results, ideas, and feedback.
- On-demand X data fetching.
- On-demand LLM calls.
- Cached results until the user requests another refresh.
- No background workers, real-time stream, embeddings, vector database, fine-tuning, or automatic publishing for now.

## Early success criteria

- Does Axe reduce time spent facing an empty composer?
- Does it help users post more frequently?
- Are the ideas specific and personally relevant?
- Does framing guidance lead to a post while preserving the user's voice?
- Do users return and use the product again?
- Which idea cards and framing suggestions actually become posts?

## Open questions

- What exact scoring formula produces the best set of top-performing creator posts?
- How many historical posts are sufficient for a reliable writing-pattern profile?
- Should users choose which tracked creators influence each framing request?
- How much information about the user's niche and goals should be entered explicitly versus inferred from public posts?
- At what point does connecting the user's X account provide enough additional value to justify OAuth complexity?
