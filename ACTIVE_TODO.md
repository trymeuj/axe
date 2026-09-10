# Axe Active To-Do

Last reviewed: 2026-09-09

This checklist reflects Axe as it exists now and the work required to put it in front of the first ten users. Product principles and decisions live in [PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md). Service status lives in [SERVICES.md](./SERVICES.md).

## Current alpha product

- [x] Inject Axe as a 500px Brave/Chrome sidebar on X
- [x] Keep the alpha public-account-only with no X OAuth
- [x] Add and remove tracked creators without an alpha limit
- [x] Search for creators using only TwitterAPI.io account-search results
- [x] Save tracked creators, fetched results, active Idea Slate, list position, and drafts locally in the extension
- [x] Remove the automatic creator analysis that previously ran when adding a creator
- [x] Remove the unused My Voice section and Live indicator
- [x] Separate creator management from the daily post feed with **Posts** and **Creators** tabs

## Recent reply-opportunity feed

- [x] Fetch each creator's public timeline on demand and keep only original posts from the last 48 hours for reply opportunities
- [x] Exclude retweets as well as replies so every candidate is the tracked creator's own post
- [x] Rank posts independently within each creator, then combine every creator's candidates into one feed
- [x] Calculate traction as `likes + 2 × reposts + 3 × replies`
- [x] Apply reply-opportunity multipliers of `1.0` under 6 hours, `0.6` at 6–24 hours, and `0.2` at 24–48 hours
- [x] Exclude posts older than 48 hours instead of filling the list with stale opportunities
- [x] Show an explicit no-recent-opportunities state when the combined feed has no eligible posts
- [x] Select up to eight eligible posts per creator, send all candidates to the LLM, and show the top 20 combined posts
- [x] Keep candidate selection and global ordering deterministic in the backend
- [x] Fetch tracked creators concurrently and keep successful results when an individual creator fetch fails
- [x] Save successful combined refreshes locally, display their timestamp, and enforce an eight-hour refresh cooldown
- [x] Discard incompatible or corrupted cached discoveries instead of showing results created by older mapping logic
- [x] Use GPT-5.6 Terra with low reasoning effort for the single combined call that creates faithful titles, mini-posts, Hot selection, and reply guidance
- [x] Match every LLM result to backend source data by exact post ID and reject unknown, duplicate, or missing IDs
- [x] Show the eligible results as clickable Inspiration Cards
- [x] Clicking a card opens its exact source post on X while preserving the active Idea Slate and previous list position across navigation

## Reply guidance and Idea Slate

- [x] Ask the LLM to mark up to four genuinely strong opportunities as **Hot**, without filling a quota
- [x] Hold every direction to a high bar and allow zero directions when nothing useful qualifies
- [x] Reject generic praise, restatements, forced disagreement, answered questions, and invented experience
- [x] Show **Hot** only on the strongest few posts and remove the random **Worth replying** label
- [x] Generate up to three short, casual creator-note directions for a post, with no required minimum
- [x] Optimize directions as audience-facing public mini-posts, preferring observations, extensions, examples, analogies, contrasts, counterpoints, or natural wit over creator-directed questions
- [x] Use questions only occasionally and only when ordinary readers are likely to answer them
- [x] Avoid polished AI language such as “discuss,” “introduce,” “explore,” and “consider”
- [x] Include a short inline “something like” example with each direction
- [x] Open an Idea Slate when an Inspiration Card is selected
- [x] Provide an autosaving writing box with character count
- [x] Provide a working **Copy post** action
- [x] Keep the Idea Slate open when the user views the original post in the same X tab

## Must complete before the first external tester

- [x] Build the first responsive Axe landing page in the existing backend/Vercel app
- [x] Rework the landing page into an X-native timeline using a sourced creator post and familiar interaction motion
- [x] Select unlisted Chrome Web Store distribution for the alpha
- [x] Create local Privacy, Terms, and Support pages and connect them from the landing-page footer
- [x] Finish Chrome Web Store developer registration and payment
- [x] Publish privacy, terms, and support pages on the Axe domain
- [ ] Prepare the Chrome Web Store icon, screenshots, descriptions, privacy disclosures, and permission explanations (everything is saved except the required product screenshot)
- [x] Create the unlisted Axe Web Store draft and upload production package `0.1.0`
- [ ] Submit the extension as an unlisted Chrome Web Store listing and address any review feedback
- [x] Push the complete current local work to GitHub
- [x] Deploy the latest backend to Vercel
- [x] Verify TwitterAPI.io, OpenAI, and the ranked-post endpoint against the production deployment
- [x] Build the extension in production mode so it points to the Vercel backend instead of `localhost:3000`
- [ ] Test installation and the complete workflow from a clean Brave profile
- [ ] Test creator search, refresh, source navigation, restored Idea Slate, draft persistence, and Copy post in production
- [ ] Write a short installation and first-use guide
- [ ] Add a lightweight way for testers to report bad cards, bad directions, and product confusion

## Paid access and account infrastructure

### Settle the commercial flow

- [ ] Choose the first paid offer: price, billing period, trial/refund policy, and whether access is subscription-based or a one-time purchase
- [ ] Define the exact website journey from landing page to Google sign-in, Razorpay checkout, successful payment, extension installation, and first use
- [ ] Define what an unpaid, pending, paid, cancelled, expired, refunded, or payment-failed user sees on both the website and in the extension

### Website authentication and checkout

- [x] Implement Google OAuth with Auth.js on the Axe website; do not add Clerk or X OAuth
- [x] Create or link the corresponding Axe user in Neon after successful Google authentication
- [ ] Create Google OAuth credentials, configure local and production callback URLs, and add the secrets locally and in Vercel
- [ ] Complete a real Google sign-in end to end after credentials are configured
- [ ] Add a website account and billing area showing access status and the appropriate payment action
- [ ] Integrate Razorpay Checkout without collecting or storing raw card, UPI, or banking credentials in Axe
- [ ] Add verified Razorpay webhooks with signature validation, idempotent processing, and safe handling of delayed or repeated events
- [ ] Add clear payment-success, payment-pending, payment-failure, cancellation, and retry experiences

### Database and paid entitlement

- [ ] Add Neon records for users, linked Google identity, Razorpay customer/subscription/payment references, current entitlement, and auditable payment events
- [ ] Store only the payment metadata Axe needs; Razorpay remains responsible for sensitive payment-method data
- [x] Make the backend—not local extension state—the source of truth for paid access
- [x] Create an authenticated entitlement endpoint the extension can use to verify whether the signed-in user may use Axe
- [ ] Decide how quickly cancellations, failed renewals, refunds, and manual access changes should affect extension access

### Extension access

- [x] Add **Sign in with Google** to the extension using a secure, expiring, one-time Auth.js website-to-extension pairing flow
- [x] Store a revocable extension session token on the device while keeping only its cryptographic hash in Neon
- [x] Allow anyone to install the extension, but lock creator search, discovery, and other paid functionality until a valid entitlement is confirmed
- [ ] Give unpaid users a clear route to purchase on the website and let newly paid users re-check access without reinstalling
- [ ] Handle expired sessions and temporary network failures without incorrectly granting access or trapping valid customers

### Security, launch, and operations

- [ ] Protect TwitterAPI.io and OpenAI endpoints with authenticated, server-enforced usage allowances tied to the paid user
- [x] Prevent clients from granting themselves access by modifying local storage or calling paid endpoints directly
- [ ] Update Privacy, Terms, Support, and Chrome Web Store disclosures for Google authentication, Neon account storage, Razorpay payments, and deletion/refund handling
- [ ] Test new purchase, returning login, pending payment, failed renewal, cancellation, refund, logout, reinstall, and account-deletion flows
- [ ] Add basic internal visibility for customer access and payment-webhook failures without exposing sensitive payment data

## First-ten-user rollout

- [ ] Invite two trusted testers first
- [ ] Watch at least one tester use Axe without live guidance
- [ ] Record where onboarding or the core workflow breaks
- [ ] Fix critical reliability and comprehension issues
- [ ] Expand access gradually to ten users
- [ ] Measure whether users return, open Inspiration Cards, write drafts, and copy posts
- [ ] Decide after the alpha whether Axe is useful and sellable enough to continue

## Later, after the alpha proves value

- [ ] Decide whether to build the original second mode for framing a user's rough idea
- [ ] Decide whether creator writing-pattern analysis adds meaningful value
- [ ] Reconsider public-account personalization only if testers need it
- [ ] Decide whether creator lists, results, and drafts should move from local extension storage to Neon for cross-device persistence; paid entitlement data is server-side regardless
- [ ] Decide whether to make the Chrome Web Store listing public after the alpha

## Explicitly out of scope for this alpha

- X OAuth or private-account metrics
- My Voice/account-analysis interface
- Creator-size normalization or relative-to-average performance scoring
- Inspecting engagement on individual replies
- Real-time monitoring or background refresh jobs
- Automatic posting to X
- Finished AI-written replies or posts
- Fine-tuning, embeddings, or a vector database
- Scale work beyond approximately ten users
- Complicated plans, teams, or enterprise features
