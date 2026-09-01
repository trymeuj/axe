# Axe Product Direction

Last updated: September 1, 2026

This is the living product record for Axe. It should describe the product we are actually building now, while keeping later ideas clearly separated from the alpha.

## Purpose

Axe reduces the activation energy required to participate meaningfully on X.

It helps a user:

1. Find recent posts from creators they follow that are genuinely worth replying to.
2. See a few useful ways into the conversation.
3. Write the reply themselves in their own voice.

Axe is not an automatic post writer. It should remove the difficult starting work without replacing the user's judgment or writing.

## Current alpha: recent reply opportunities

Mode 1 is the complete scope of the current alpha.

The product has two tabs:

- **Creators:** the user adds and removes the public X accounts they want Axe to monitor. There is no creator limit for the first ten users.
- **Posts:** the user's daily workspace. Axe analyzes all tracked creators together and returns one ranked feed of reply opportunities.

The feed is organized by opportunity, not by creator. Each post still shows who published it.

## Daily workflow

1. The user adds public creator accounts in the Creators tab.
2. The user asks Axe to find posts.
3. Axe fetches eligible recent posts from every tracked creator.
4. Axe ranks candidates and evaluates them together.
5. Axe shows up to 20 combined reply opportunities.
6. The user opens an Inspiration Card to see the original post and an Idea Slate.
7. The user uses the rough directions as prompts, writes their own reply, and copies the finished post.

## Candidate selection and ranking

Axe considers only:

- Original posts published within the last 48 hours.
- No replies.
- No reposts.

For each creator, Axe calculates:

> Traction = likes + 2 × reposts + 3 × replies

It then applies the following recency multiplier:

- Under 6 hours: × 1.0
- 6–24 hours: × 0.6
- 24–48 hours: × 0.2
- Older than 48 hours: excluded

The final internal rank is:

> Final rank = Traction × recency multiplier

Axe selects up to eight candidates per creator, combines those candidates, and evaluates the entire pool in one AI call. Users do not see the numeric scores.

High engagement on a recent post is the alpha proxy for momentum. Axe does not yet track engagement changes over time, inspect the traction of individual replies, normalize by creator size, or compare a post with the creator's historical average.

If a creator has no eligible posts, Axe does not substitute stale content. If the combined pool is empty, it shows that there are no recent reply opportunities.

## AI evaluation

The combined candidate pool is sent in one call to GPT-5.6 Terra with low reasoning effort, balancing recommendation quality with acceptable refresh latency.

For every returned post, Axe may provide up to three concise thinking directions. There is no minimum: it should return no directions when none meet a high standard. These should feel like rough creator notes, not polished AI copy or finished replies.

Good directions treat a reply as a public mini-post for everyone reading the thread, not a private exchange with the creator. They help the user:

- Add a sharp observation, useful extension, or concrete example.
- Draw an analogy, contrast, or genuine counterpoint.
- Find a naturally witty framing when the post supports one.
- Occasionally ask a question that ordinary readers are likely to answer.

Up to four genuinely strong opportunities receive a prominent **Hot** tag. Hot is earned rather than quota-filled, so Axe may mark fewer or none when the candidates do not meet the standard.

A direction should remain interesting even if the creator never responds and should give the wider audience something to like, relate to, disagree with, answer, or build upon. Axe should reject generic praise, restatements, forced disagreement, invented experiences, creator-only clarification requests, questions already answered by the post, engagement bait, and copy-paste-ready replies.

## Source integrity

Every AI result must map back to the exact source post using its source post ID.

Unknown, duplicate, or missing IDs invalidate the entire refresh. Axe must never silently pair AI output with a different post based on list position. Accuracy is more important than returning partial results.

## Interaction behavior

- Clicking an Inspiration Card opens its original X post and keeps that card's Idea Slate active.
- Returning to the X feed should not reset Axe to the creator list or lose the user's place.
- The Idea Slate contains the original context, rough thinking directions, a writing area, and a **Copy post** action.
- Opening the original post must not force the user to rediscover the card.

## Refresh and storage behavior

- A successful discovery result is cached locally for eight hours.
- The UI shows when the last analysis was completed and when the next refresh is available.
- Repeated refreshes are blocked during the eight-hour window.
- Incompatible or corrupted older cached results are discarded rather than displayed.

The alpha does not require user accounts or X OAuth. The tracked creators and discovery state can remain local to the extension for the first ten users.

## Product principles

- **Participation, not automation:** the user writes the final reply.
- **Opportunity over volume:** show fewer useful posts rather than fill the feed with stale or weak ones.
- **Exact source fidelity:** every recommendation must belong to the post it opens.
- **Natural language:** directions should sound direct and human, not formal, polished, or AI-ish.
- **On demand:** expensive fetching and AI work happen only when the user requests a refresh.
- **Simple for ten users:** validate usefulness before building for scale.

## Alpha success criteria

The current product is working if users can consistently:

- Find recent conversations they would otherwise have missed.
- Understand quickly why and how they could contribute.
- Move from discovery to writing without losing context.
- Produce replies that still feel like their own thinking and voice.

## Later, after Mode 1 is validated

These ideas remain valid possibilities but are not part of the current implementation:

- **Mode 2: frame a thought.** The user brings a rough idea and Axe suggests hooks, structures, phrases, examples, and framing options without writing the final post.
- One-time creator writing-pattern analysis.
- Public-account personalization based on the user's own posting history.
- Creator-relative performance baselines and follower normalization.
- Engagement momentum measured across multiple snapshots.
- Analysis of the traction received by individual replies.
- Server-side user accounts, cross-device state, billing, and persistent database storage.
- X OAuth or private-account access.

These should be reconsidered only after the first ten users demonstrate that the current reply-opportunity workflow is useful.
