"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
import { api } from "@/lib/api";

const appBaseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: appBaseUrl,
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

let memoryJwtToken: string | null = null;
let memoryJwtExpiresAt = 0;

/**
 * Fetches the JWT token for API calls to the Express server.
 * Updates local token storage for api.ts to include in Authorization: Bearer <token>.
 */
export async function getJwt(forceRefresh = false): Promise<string | null> {
  if (typeof window === "undefined") return null;

  // 1. Return unexpired memory token if available
  if (!forceRefresh && memoryJwtToken && Date.now() < memoryJwtExpiresAt) {
    return memoryJwtToken;
  }

  // 2. Check stored token in api module
  const storedToken = api.getToken();
  if (!forceRefresh && storedToken) {
    memoryJwtToken = storedToken;
    return storedToken;
  }

  // 3. Fetch fresh token from BetterAuth JWT endpoint
  try {
    const response = await fetch(`${appBaseUrl}/api/auth/token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.token) {
        memoryJwtToken = data.token;
        // Cache token for 10 minutes
        memoryJwtExpiresAt = Date.now() + 10 * 60 * 1000;
        api.setToken(data.token);
        return data.token;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch JWT token from /api/auth/token:", error);
  }

  return api.getToken();
}

/**
 * Convenience hook for authentication state and user profile
 */
export function useAuth() {
  const session = useSession();

  return {
    user: session.data?.user ?? null,
    session: session.data?.session ?? null,
    isAuthenticated: Boolean(session.data?.user),
    isLoading: session.isPending,
    isPending: session.isPending,
    isRefetching: session.isRefetching,
    error: session.error,
    refetch: session.refetch,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: async () => {
      memoryJwtToken = null;
      memoryJwtExpiresAt = 0;
      api.setToken(null);
      return await authClient.signOut();
    },
    getJwt,
  };
}
