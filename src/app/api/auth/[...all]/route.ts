import { auth } from "@/lib/auth";
import { connectToMongo } from "@/lib/mongodb";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

async function ensureDatabase(): Promise<Response | null> {
  try {
    await connectToMongo();
    return null;
  } catch (error) {
    console.error("[BetterAuth] MongoDB connection failed:", error);
    return Response.json(
      { message: "Authentication database unavailable." },
      { status: 503 }
    );
  }
}

export async function GET(req: Request) {
  const databaseError = await ensureDatabase();
  return databaseError ?? handlers.GET(req);
}

export async function POST(req: Request) {
  const databaseError = await ensureDatabase();
  return databaseError ?? handlers.POST(req);
}
