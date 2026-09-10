# Axe Product Direction

Last updated: September 10, 2026

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

Tracked creators, discovery results, the active slate, and drafts can remain local to the extension initially. Paid access, however, requires an Axe account and a server-side entitlement; local storage must never decide whether a user has paid.

## Website, accounts, and paid access

The website is Axe's commercial entry point. A user can learn about Axe, sign in with Google, pay through Razorpay, see their access status, and then install the extension.

The extension may be downloaded before payment, but its core functionality remains locked until the user signs in and Axe's backend confirms an active paid entitlement. The website and extension must recognize the same Axe account. A successful purchase should unlock an already-installed extension without requiring reinstallation.

Neon is the source of truth for Axe users and access. Axe stores the Google identity link, Razorpay customer/subscription/payment references, entitlement status, and the payment-event history needed for support and auditing. Razorpay remains responsible for card, UPI, and banking credentials; Axe must not collect or store raw payment-method data.

Google authentication is for the Axe account only. Axe will implement Google OAuth through Auth.js, link that identity to an Axe user in Neon, and securely hand an authenticated session to the extension. Clerk and X login are not part of this architecture. This does not change the decision to use public X data and does not introduce X OAuth.

Paid TwitterAPI.io and OpenAI endpoints must require authenticated server-side authorization and a usage allowance. Hiding the interface in the extension or storing a paid flag locally is not sufficient protection.

## Product principles

- **Participation, not automation:** the user writes the final reply.
- **Opportunity over volume:** show fewer useful posts rather than fill the feed with stale or weak ones.
- **Exact source fidelity:** every recommendation must belong to the post it opens.
- **Natural language:** directions should sound direct and human, not formal, polished, or AI-ish.
- **On demand:** expensive fetching and AI work happen only when the user requests a refresh.
- **Simple for ten users:** validate usefulness before building for scale.
- **Installable but entitlement-gated:** distribution is open, while valuable functionality requires verified paid access.
- **Payments stay with the payment provider:** Axe stores entitlement and transaction references, never raw payment credentials.

## Landing-page positioning and copy taste

The landing page should not blend the styles of several reference products. References are useful for isolating principles; Axe still needs one coherent position and its own visual identity.

The two useful reference lessons are:

- **Tweet Hunter:** lead with a bold, desirable first-order outcome. Do not weaken the promise merely to make every word defensible or technically exhaustive. The visitor should want the outcome before learning every detail of the mechanism.
- **Screen Studio:** communicate one clear idea in one clean line, with very little surrounding copy.

Typefully and Magical are not useful copy references for Axe. Phrases such as “write better content,” “save time,” or other second-order benefits feel vague because they do not make the immediate user benefit obvious. The other premium SaaS references may offer visual craft, but they should not determine Axe's positioning.

Axe has a direct first-order problem to own: small creators struggle to grow because they fail to show up consistently, often because they open X without knowing what to post or where to contribute. The page should quietly activate that fear of falling behind, then make Axe feel like the credible solution.

Copy should therefore follow one of two approaches:

1. State a bold, emotionally desirable outcome without timid qualifiers.
2. State exactly what Axe gives the user in one short, concrete line.

The preferred voice is clean Gen Z: direct, sharp, natural, and confident. Avoid corporate abstractions, polished AI language, vague second-order value, forced slang, excessive explanation, and safety-first qualifiers such as “worth making.” One objective promise is stronger than several technically accurate claims.

The locked hero message is: **“Trying to stay consistent on X / Don’t know what to post daily? / Solve it with Axe and hit bangers.”** The X in the first line should use the X logo rather than plain text. This is the real outcome and must not be replaced by a description of how the product works, such as “your next five replies, found.” The hero does not need an explanatory line beneath this message; the product visual supplies the mechanism.

The locked hero composition takes its cue from Tweet Hunter: large, emotionally direct editorial copy and the primary install CTA on the left; a large, slightly tilted Axe product visual on the right. The visual should show Axe's tracked-creators sidebar, making the mechanism understandable without adding paragraphs. The page should preserve Axe's X-native black, white, and blue language without literally reproducing Tweet Hunter's page.

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
- Cross-device synchronization of creator lists, discovery results, slates, and drafts.
- X OAuth or private-account access.

These should be reconsidered only after the first ten users demonstrate that the current reply-opportunity workflow is useful.
