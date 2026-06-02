import { subscribe } from "@/lib/events";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection event
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      const unsubscribe = subscribe(id, (payload) => {
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Stream closed
          unsubscribe();
        }
      });

      // Keep-alive ping every 15s
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":ping\n\n"));
        } catch {
          clearInterval(interval);
          unsubscribe();
        }
      }, 15000);

      // Cleanup on close
      const cleanup = () => {
        clearInterval(interval);
        unsubscribe();
      };

      // Signal abort handling
      if ("signal" in _req && (_req as any).signal) {
        (_req as any).signal.addEventListener("abort", cleanup);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
