# BookNook

BookNook is a community library web app for discovering books, sharing a
collection, and managing loans. The Next.js frontend connects to a separate
Express and MongoDB API.

- **Live site:** [booknook-theta.vercel.app](https://booknook-theta.vercel.app/)
- **Frontend repository:** [shahadathkx/booknook](https://github.com/shahadathkx/booknook)
- **Backend repository:** [shahadathkx/booknook-server](https://github.com/shahadathkx/booknook-server)

## Features

- Browse, search, and filter the book catalog.
- View book details and availability.
- Register and sign in with email/password; Google sign-in is optional.
- Add and edit books when signed in.
- Borrow available books and return active loans.
- Browse a responsive interface with light and dark themes.

## Technology

- Next.js 16 App Router, React, and TypeScript
- Tailwind CSS 4 and DaisyUI
- Better Auth with MongoDB and optional Google OAuth
- Express and MongoDB API in the [backend repository](https://github.com/shahadathkx/booknook-server)
- Vercel deployments for the frontend and API

## Run locally

Requirements: Node.js 20 or later, npm, and a MongoDB database.

1. Clone this repository and install dependencies:

   ```bash
   git clone https://github.com/shahadathkx/booknook.git
   cd booknook
   npm install
   ```

2. Create a local environment file from the example:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Set the values in `.env`. For a local backend, use
   `NEXT_PUBLIC_API_URL=http://localhost:7000` and
   `BETTER_AUTH_URL=http://localhost:3000`. Set a private
   `BETTER_AUTH_SECRET` with at least 32 characters and a valid `MONGODB_URI`.

4. In a separate terminal, clone and configure the
   [backend](https://github.com/shahadathkx/booknook-server), then start it:

   ```bash
   npm install
   npm run dev
   ```

5. Start the frontend from the `booknook` directory:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Environment variables

Set these in the frontend `.env` for local development and in the frontend
Vercel project's **Settings → Environment Variables** for deployment.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the Express API, e.g. `http://localhost:7000` locally. Use the deployed backend origin in production; do not append `/api`. |
| `BETTER_AUTH_URL` | Yes | Canonical frontend origin, e.g. `http://localhost:3000` or `https://booknook-theta.vercel.app`. |
| `BETTER_AUTH_SECRET` | Yes | Private Better Auth signing/encryption secret; at least 32 characters. |
| `MONGODB_URI` | Yes | MongoDB connection string used by Better Auth. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Frontend origin used by client-side auth helpers. |
| `TRUSTED_ORIGINS` | Recommended | Comma-separated trusted origins; for example `http://localhost:3000` locally or `https://booknook-theta.vercel.app` in production. |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID. Configure it together with the client secret to enable Google sign-in. |
| `GOOGLE_CLIENT_SECRET` | Optional | Private Google OAuth client secret. |
| `MONGODB_DB_NAME` | Optional | Database name used by Better Auth if it is not present in the URI; defaults to `booknook`. |
| `NEXT_PUBLIC_IMGBB_KEY` | Optional | ImgBB API key for book-cover uploads. This `NEXT_PUBLIC_` value is exposed to the browser. |
| `NEXT_PUBLIC_APP_NAME` | Optional | Display name; defaults to `BookNook`. |
| `NEXT_PUBLIC_LIBRARY_BRANCH` | Optional | Library branch label shown in the interface. |
| `NEXT_PUBLIC_DEFAULT_LOAN_DAYS` | Optional | Default loan duration in days; defaults to `14`. |
| `NEXT_PUBLIC_LIBRARY_MOTTO` | Optional | Library motto shown by the app. |

Use the matching backend variables in the backend project's own
[`.env.example`](https://github.com/shahadathkx/booknook-server/blob/main/.env.example):
`MONGODB_URI`, `DB_NAME`, `CLIENT_URL`, and `AUTH_JWKS_URL`. The backend's
`CLIENT_URL` must match the deployed frontend origin, and `AUTH_JWKS_URL` must
point to that frontend's `/api/auth/jwks` endpoint.

### Google OAuth

To enable Google sign-in:

1. Set both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the frontend
   environment.
2. In Google Cloud Console, add the frontend origin to **Authorized JavaScript
   origins**.
3. Add `https://YOUR-FRONTEND-DOMAIN/api/auth/callback/google` to **Authorized
   redirect URIs**. For the current production site, this is
   `https://booknook-theta.vercel.app/api/auth/callback/google`.
4. If the OAuth consent screen is in Testing, add the signing-in Google account
   as a test user.
5. Redeploy the frontend after changing environment variables.

## Checks

Run these commands from the frontend project directory:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Deployment

Deploy the frontend and backend as separate Vercel projects, each connected to
its own repository. Configure each project's environment variables before
deploying. The frontend `NEXT_PUBLIC_API_URL` must use the backend's deployed
origin; the backend `CLIENT_URL` and `AUTH_JWKS_URL` must refer to the frontend.
After changing environment variables, redeploy the affected project.

Do not commit `.env` files or share secrets publicly. If a database password,
auth secret, OAuth secret, or API key is exposed, rotate it and update the
corresponding deployment variables.
