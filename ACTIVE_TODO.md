# Axe Active To-Do

Last reviewed: 2026-08-24

This is the active implementation checklist for the current Axe MVP. Keep tasks broad until the product behavior is decided in more detail. Check items off only when the user-facing flow works end to end.

Product principles and decisions live in [PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md).
External dependencies and their latest live status are tracked in [SERVICES.md](./SERVICES.md).

## Foundation already present

- [x] Brave/Chrome extension that injects an Axe sidebar into X
- [x] Add and remove up to five inspiration creators
- [x] Fetch a public creator profile and recent public posts
- [x] Run a basic one-time AI analysis that returns topics, general patterns, posting frequency, and top posts
- [x] Save tracked creators and their current analysis in extension-local storage
- [x] Fetch the user's public profile and a small set of recent posts from their username

These are foundations, not completion of Mode 1 or Mode 2.

## Product foundation to improve

- [ ] Replace the current general creator analysis with a meaningful writing-pattern profile based on strong posts versus ordinary posts
- [ ] Select top-performing creator posts using relative performance rather than likes alone
- [ ] Add useful public-account personalization based on the user's own posts and performance
- [ ] Persist the MVP data reliably for the user instead of depending only on extension-local storage
- [x] Provision Neon PostgreSQL through the Axe Vercel project and replace the invalid legacy Supabase connection
- [ ] Recharge TwitterAPI.io credits so production X-data requests succeed
- [ ] Keep the MVP public-account-only; do not add X OAuth
- [ ] Remove or redesign existing features that do not serve the two core modes

## Mode 1 — Help me find an idea

- [ ] Add an explicit user-triggered **Refresh inspiration** flow
- [ ] Fetch and filter approximately the previous seven days of posts from selected inspiration creators
- [ ] Rank recent material using recency, relative performance, relevance, and usefulness
- [ ] Turn the selected material into idea cards rather than finished posts
- [ ] Personalize idea cards using the user's public account, topics, and posting history
- [ ] Let the user select, save, dismiss, or develop an idea
- [ ] Ensure the complete Mode 1 flow works inside the extension

## Mode 2 — Help me frame an idea

- [ ] Let the user enter a rough thought, observation, experience, or selected Mode 1 idea
- [ ] Let the user choose which inspiration creators should influence the framing
- [ ] Use stored creator writing patterns to produce several framing approaches
- [ ] Return only creative scaffolding: openings, structure, questions, evidence prompts, contrasts, closing directions, and short phrase fragments
- [ ] Prevent the AI and interface from producing a finished copy-paste post
- [ ] Give the user a simple place to develop or transfer the idea into the X composer
- [ ] Ensure the complete Mode 2 flow works inside the extension

## Ten-user readiness

- [x] Make the backend and extension build successfully together
- [ ] Protect API keys and prevent unrestricted public use of paid endpoints
- [ ] Add simple error, loading, retry, and empty states for the two modes
- [ ] Capture lightweight feedback about which ideas and framing suggestions were useful
- [ ] Test the complete workflow personally before inviting early users
- [ ] Prepare a simple setup/onboarding path for the first ten users

## Explicitly out of scope for now

- X OAuth or private-account metrics
- Automatic publishing to X
- Real-time creator monitoring
- Background refresh jobs
- Fine-tuning, embeddings, or vector databases
- Scale optimization beyond approximately ten users
- Complicated plans, teams, or enterprise features
