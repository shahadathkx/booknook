import { getAuthHandlers } from "@/lib/auth";
import { connectToMongo } from "@/lib/mongodb";

async function dispatch(req: Request, method: "GET" | "POST"): Promise<Response> {
  try {
    await connectToMongo();
  } catch (error) {
    console.error("[BetterAuth] MongoDB connection failed:", error);
    return Response.json(
      { message: "Authentication database unavailable." },
      { status: 503 }
    );
  }

  const handlers = await getAuthHandlers();
  return handlers[method](req);
}

export const GET = (req: Request) => dispatch(req, "GET");
export const POST = (req: Request) => dispatch(req, "POST");
