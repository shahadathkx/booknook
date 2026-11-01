import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { clientInstance, db } from "./mongodb";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined) ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const rawOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(",").map((s) => s.trim())
  : [
      "http://localhost:3000",
      "http://localhost:7000",
      baseURL,
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000",
    ];

const trustedOrigins = Array.from(new Set(rawOrigins.filter(Boolean)));

const hasGoogleConfig = Boolean(
  process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: clientInstance,
    transaction: false,
  }),
  baseURL,
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "local-development-secret-key-32chars-minimum-booknook",
  trustedOrigins,
  account: {
    storeStateStrategy: "cookie",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(hasGoogleConfig
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
          },
        }
      : {}),
  },
  plugins: [
    jwt({
      jwks: {
        jwksPath: "/jwks",
      },
    }),
  ],
});
