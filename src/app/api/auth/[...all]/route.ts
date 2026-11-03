import { getAuthHandlers } from "@/lib/auth";

async function dispatch(req: Request, method: "GET" | "POST"): Promise<Response> {
  try {
    const handlers = await getAuthHandlers();
    return await handlers[method](req);
  } catch (error) {
    console.error("[BetterAuth] Request failed:", error);
    const message =
      error instanceof Error &&
      /^(BETTER_AUTH_URL|BETTER_AUTH_SECRET) must /.test(error.message)
        ? error.message
        : "Authentication service is unavailable. Check the deployment configuration and database connection.";
    return Response.json(
      { message },
      { status: 503 }
    );
  }
}

export const GET = (req: Request) => dispatch(req, "GET");
export const POST = (req: Request) => dispatch(req, "POST");
