import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { toNextJsHandler } from "better-auth/next-js";
import { connectToMongo, getMongoDatabase } from "./mongodb";

let handlers: ReturnType<typeof toNextJsHandler> | undefined;

export async function getAuthHandlers(): Promise<ReturnType<typeof toNextJsHandler>> {
  if (handlers) return handlers;

  const client = await connectToMongo();
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
    ? process.env.TRUSTED_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000", baseURL];
  const trustedOrigins = Array.from(new Set(rawOrigins.filter(Boolean)));
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  const auth = betterAuth({
    database: mongodbAdapter(getMongoDatabase(), {
      client,
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
      ...(googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
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

  handlers = toNextJsHandler(auth);
  return handlers;
}
