# BookNook

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Vercel environment variables

Set these variables in the Vercel project settings for each deployment environment:

- `NEXT_PUBLIC_API_URL`: deployed Express API base URL.
- `BETTER_AUTH_URL`: deployed frontend origin.
- `BETTER_AUTH_SECRET`: a private secret with at least 32 characters.
- `MONGODB_URI`: MongoDB connection string for the shared BookNook database.

Optional variables include `TRUSTED_ORIGINS`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, and `NEXT_PUBLIC_IMGBB_KEY`. Set
`NEXT_PUBLIC_APP_URL` to the frontend origin if OAuth redirects use it.

To enable Google sign-in, set both `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` in Vercel and add
`https://booknook-theta.vercel.app/api/auth/callback/google` as an authorized
redirect URI in the Google OAuth client. Replace the hostname if you use a
different production domain. Redeploy after changing environment variables.
