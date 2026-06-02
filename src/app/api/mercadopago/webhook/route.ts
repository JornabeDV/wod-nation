import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MercadoPago sends payment notifications
    // Typical payload has data.id and type
    const paymentId = body.data?.id;
    const topic = body.type || body.topic;

    if (topic === "payment" && paymentId) {
      // In a real implementation, verify the payment with MercadoPago API
      // For MVP, we trust the webhook and update based on external_reference
      const payment = body.data; // Simplified

      // Find registration by payment ID or external_reference
      const registration = await db.registration.findFirst({
        where: { paymentId: String(paymentId) },
      });

      if (!registration) {
        // Try by external_reference if available in query
        const { searchParams } = new URL(req.url);
        const extRef = searchParams.get("external_reference");
        if (extRef) {
          await db.registration.updateMany({
            where: { id: extRef },
            data: { paymentStatus: "PAID" },
          });
        }
        return NextResponse.json({ received: true });
      }

      await db.registration.update({
        where: { id: registration.id },
        data: { paymentStatus: "PAID" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ received: true });
  }
}
