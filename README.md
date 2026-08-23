# Axe

Axe helps creators decide what to post and how to frame it using useful patterns from creators they admire. The user writes the final post; Axe supplies topics, angles, questions, and structural guidance.

## Repository structure

```text
axe/
├── backend/     Next.js API deployed to Vercel
└── extension/   Brave/Chrome extension used inside X
```

The browser extension is the product users install. The backend runs invisibly on Vercel, keeps paid API credentials private, fetches public X information, calls the LLM, and persists results in Neon PostgreSQL.

## Product documentation

- [Product direction](./PRODUCT_DIRECTION.md)
- [Active implementation to-do](./ACTIVE_TODO.md)
- [Services and live status](./SERVICES.md)

## Local setup

### 1. Configure the backend

```bash
cp backend/.env.example backend/.env.local
```

Add:

- `TWITTERAPI_IO_KEY`
- `OPENAI_API_KEY`
- `DATABASE_URL` when Neon persistence is enabled

X OAuth is intentionally not used by the current public-account MVP.

### 2. Configure the extension

```bash
cp extension/.env.example extension/.env
```

For local development, keep:

```text
VITE_API_BASE=http://localhost:3000
```

### 3. Install and run

```bash
npm run install:all
npm run dev:backend
```

In another terminal:

```bash
npm run build:extension
```

Load `extension/dist` as an unpacked extension from `brave://extensions` or `chrome://extensions`.

## Build everything

```bash
npm run build
```

## Deploy the backend to Vercel

1. Import this GitHub repository into Vercel.
2. Set the Vercel project **Root Directory** to `backend`.
3. Add `TWITTERAPI_IO_KEY` and `OPENAI_API_KEY` in Vercel environment variables.
4. Provision Neon PostgreSQL through the Vercel Marketplace and connect it to the backend project.
5. Deploy the project.
6. Set `VITE_API_BASE` in `extension/.env` to the deployed Vercel URL.
7. Rebuild the extension before distributing it.

The extension must never contain OpenAI, TwitterAPI.io, or database credentials.
