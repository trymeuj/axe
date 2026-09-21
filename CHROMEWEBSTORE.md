# Chrome Web Store Listing — Axe – X Growth Assistant

> Last updated: 2026-09-21
> Store ID: `bpbanjfbnboinndignfccecfpaaigkld`
> Current status: Pending review

## Launch verdict

Axe has a credible, conversion-ready first listing: a clear searchable name, benefit-led summary, four screenshots, public distribution, a live support page, and a detailed privacy policy. The biggest remaining opportunity is not more copy. It is removing a development-only host permission, aligning permission disclosures with the package, attaching the verified official website, and earning the first genuine reviews after publication.

## Store listing

**Extension name**

Axe – X Growth Assistant

**Current short description**

Find timely X posts worth replying to and write thoughtful replies in your own voice.

**Recommended short-description test after launch**

Find high-potential X posts, spot timely reply opportunities, and write standout replies in your own voice.

Do not change this while version 0.1.3 is under review. Test it only after the initial listing is published and baseline impressions and installs exist.

**Current detailed description**

Find the right conversations to join on X.

Axe is an X growth assistant for creators, founders, freelancers, consultants, and personal-brand builders. It finds timely posts from creators you choose and gives you useful directions for writing a thoughtful reply in your own voice.

With Axe, you can:
• Track the X creators you care about
• Find their strongest recent posts in one ranked feed
• Spot timely reply opportunities before the conversation goes stale
• Explore useful angles before you start writing
• Draft and copy your reply directly inside X
• Keep the final response in your own voice

How it works:
1. Add public creators you want Axe to watch.
2. Ask Axe to find recent reply opportunities.
3. Open a promising post and review concise thinking directions.
4. Write, copy, and publish the final reply yourself.

Axe is a reply assistant, not an automated reply bot. It does not connect to your X account or automatically post, reply, like, or follow. Your drafts stay in your browser.

Google sign-in and an active Axe subscription are required to use the core features.

**Recommended opening-line test after launch**

Find high-potential X posts worth replying to—before the conversation moves on.

Keep the remainder of the current description until real search-query and conversion data gives us a reason to change it.

**Category**

Social Networking

**Primary language**

English

**Single purpose currently submitted**

Axe helps users find recent public X posts worth replying to, offers concise thinking directions, and provides a local drafting space so users can write and copy their own replies.

**Recommended tighter single purpose for the next submission**

Axe helps users find timely public X posts and develop their own thoughtful replies.

## Graphics and assets

| Asset | Required dimensions | Current status | Repository source |
|---|---:|---|---|
| Store icon | 128×128 PNG | Ready | `extension/icons/icon128.png` |
| Screenshot 1 | 1280×800 PNG/JPEG | Ready; strongest confidence-building visual and first in gallery | `backend/public/store-assets/axe-cws-01.png` |
| Screenshots 2–4 | 1280×800 PNG/JPEG | Present in submitted listing; source files need to be added to the repository | Not recorded |
| Screenshot 5 | 1280×800 PNG/JPEG | Optional; do not create until it adds a distinct benefit | — |
| Small promo tile | 440×280 PNG/JPEG | Missing; useful for featuring eligibility | — |
| Marquee promo tile | 1400×560 PNG/JPEG | Missing; low priority before traction | — |
| Global promo video | YouTube URL | Missing; low priority before traction | — |

The first screenshot should keep the polished “Trying to stay consistent on X?” outcome-led composition. Before the next asset update, replace identifiable creator names, avatars, verification marks, and illustrative post text with clearly fictional demo identities or exact real product data that you have permission to show. The current mockup can otherwise imply endorsement or present invented content as a real in-product result; one sample also contains a stale “2024” reference. The next screenshots should show the mechanism in sequence: tracked creators, ranked reply opportunities, thinking directions, and the local drafting/copy flow.

## URLs and distribution

| Field | Current value | Status |
|---|---|---|
| Homepage | https://axe.oddpages.site | Ready |
| Support | https://axe.oddpages.site/support | Ready, but copy still says “unlisted” and must be updated when public |
| Privacy policy | https://axe.oddpages.site/privacy | Ready |
| Official URL | None | Add the verified site through Google Search Console after approval |
| Visibility | Public | Ready |
| Regions | All regions | Ready |
| Payments | Contains in-app purchases | Accurate |

## Permissions justification

| Permission | Type | Current justification | Audit result |
|---|---|---|---|
| `clipboardWrite` | Permission | Used only after the user clicks Copy post; Axe does not read clipboard contents. | Good |
| `storage` | Permission | Current dashboard copy mentions only the extension session token. | Incomplete: Axe also stores the access cache locally. User-created drafts and creator state use local browser storage and are covered by the privacy policy. |
| `https://x.com/*` | Host permission/content script | Displays the Axe sidebar alongside X. | Good |
| `https://twitter.com/*` | Host permission/content script | Supports the legacy X domain. | Good |
| `https://axe.oddpages.site/*` | Host permission | Required for authenticated Axe API requests. | Missing from the current dashboard justification. |
| `http://localhost:3000/*` | Host permission | Development only. | Remove from the production manifest before the next package upload. |

**Recommended host-permission justification for the next submission**

Access to x.com and twitter.com is required to display the Axe sidebar while the user browses X. Access to axe.oddpages.site is required to sign the user in, verify their Axe subscription, retrieve public creator information, and return ranked reply opportunities. Axe does not read X credentials, private messages, private account data, or the user’s general feed, and it never posts or takes actions on the user’s behalf.

## Privacy and data use

**Current dashboard selections**

- Personally identifiable information: collected
- Authentication information: collected
- Location, including IP address: collected
- User activity: collected
- Health, financial, communications, web history, and website content: not selected
- All three Limited Use certifications: selected
- Remote code: no

**Audit result**

The public privacy policy is unusually strong for an early extension and explains account data, session tokens, public creator searches, AI processing, local drafts, infrastructure logs, providers, retention, and deletion. Before the next submission, verify whether “User activity” is genuinely required; no analytics or behavioral tracking was found in the extension code reviewed on 2026-09-21. Keep it selected only if backend operational logs or another production system actually use data that Google classifies this way.

## Priority actions

### Before changing the pending submission

- Let version 0.1.3 finish review unless Google raises a permissions issue.
- Do not churn the listing copy during review; the current copy is already launch-worthy.

### First package update after approval

- Remove `http://localhost:3000/*` from the production manifest.
- Replace the host-permission justification with the complete version above.
- Expand the `storage` justification so it matches actual local extension storage.
- Update the support page from “unlisted” to the current public release state.
- Add the other three submitted screenshot source files to the repository.
- Preserve the first screenshot’s composition while replacing recognizable creators and stale illustrative content with safe, current demo data.

### First traction loop

- Attach `axe.oddpages.site` as the official verified website.
- Ask genuine activated users—not testers who never used the core flow—for an honest Chrome Web Store review.
- Check impressions, installs, and listing conversion weekly.
- Change one major element at a time: first screenshot, then short description, then title only if evidence demands it.
- Create the 440×280 small promo tile after the listing is live.

## Version history

| Version | Date | Changes | Status |
|---|---|---|---|
| 0.1.3 | 2026-09-20 | Public listing, optimized name and summary, polished first screenshot, four-image gallery, support and privacy URLs | Pending review |
| 0.1.2 | 2026-09 | Earlier extension release | Published previously |
| 0.1.1 | 2026-09 | Initial unlisted Chrome Web Store release | Published previously |

## Success metrics

For the first month, use a tiny scoreboard rather than a large SEO program:

1. Store impressions
2. Listing-page visitors or acquisition impressions available in the dashboard
3. Installs
4. Install-to-active-user retention
5. Rating count and average rating

The first optimization goal is enough qualified impressions to learn. The second is improving install conversion. Reviews and retained users matter more than adding more keywords to an already relevant listing.
