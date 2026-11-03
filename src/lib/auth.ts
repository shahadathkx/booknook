import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { clientInstance, db } from "./mongodb";

const baseURL = process.env.BETTER_AUTH_URL?.trim();
if (!baseURL) {
  throw new Error("BETTER_AUTH_URL must be configured.");
}

const secret = process.env.BETTER_AUTH_SECRET?.trim();
if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters long.");
}

try {
  new URL(baseURL);
} catch {
  throw new Error("BETTER_AUTH_URL must be a valid absolute URL.");
}

const rawOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:3000", baseURL];

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
  secret,
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
