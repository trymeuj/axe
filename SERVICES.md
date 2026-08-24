# Axe Services

Last live check: 2026-08-24

## Required for the current MVP

| Service | Purpose | Current implementation | Live status |
|---|---|---|---|
| TwitterAPI.io | Fetch public X profiles, timelines, posts, and public engagement data | Used by the active `/api/v0` routes | Credentials are valid, but production requests currently fail because the account has insufficient credits |
| OpenAI API | Creator analysis, topic extraction, idea support, and framing support | `gpt-4o-mini` currently powers creator analysis and reply ideas | Active; minimal completion request succeeded |
| Next.js backend | Protect keys and coordinate X-data and LLM requests | Local backend in `backend/`; production alias is `https://axe-psi.vercel.app` | Production deployment is public; build and OpenAI route succeed |
| Browser extension | Axe interface inside X | React/Vite extension in `extension/` | Build succeeds |
| Neon PostgreSQL through Vercel Marketplace | Persist users, analyses, refreshes, ideas, and feedback | Connected to Production, Preview, and Development; active `/api/v0` flow still uses local storage | Active; database connection verified and Axe schema applied |

## Configured but out of scope

| Service | Purpose | Decision |
|---|---|---|
| X OAuth / official X user authorization | Connected-account identity and private metrics | Disabled and removed from the active code path; do not use for the current MVP |

## Not needed now

- Real-time X stream
- Background job/queue service
- Vector database or embeddings service
- Fine-tuning service
- X publishing/write API
- Separate analytics platform
- CDN or specialized cache

## Status interpretation

- A credential being present does not mean a service is healthy.
- Live status is based on a real read-only or minimal request.
- Recheck this file after credentials, providers, models, or deployment change.
