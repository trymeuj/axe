# Axe Services

Last live check: 2026-09-02

## Required for the current MVP

| Service | Purpose | Current implementation | Live status |
|---|---|---|---|
| TwitterAPI.io | Fetch public X profiles, timelines, posts, and public engagement data | Used by the active `/api/v0` routes | Active; profile and timeline requests succeeded |
| OpenAI API | Evaluate ranked posts, select Hot opportunities, and generate reply directions | The combined discovery call uses `gpt-5.6-terra` with low reasoning effort | Active; the complete production discovery flow succeeded |
| Next.js backend | Protect keys and coordinate X-data and LLM requests | Local backend in `backend/`; production alias is `https://axe-psi.vercel.app` | V1 is deployed; landing page, API routes, CORS, legal pages, and full discovery flow are healthy |
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
