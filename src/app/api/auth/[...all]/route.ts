import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const GET = async (req: Request) => {
  try {
    return await handlers.GET(req);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Auth GET error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST = async (req: Request) => {
  try {
    return await handlers.POST(req);
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err?.message || "Auth POST error",
        stack: err?.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
