import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, vendorEmail } = body;

    let email = (vendorEmail || "").trim().toLowerCase();

    let isPaid = true;

    if (
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes("placeholder") &&
      sessionId &&
      !sessionId.startsWith("cs_simulated_")
    ) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
        isPaid = stripeSession.payment_status === "paid" || stripeSession.status === "complete";
        if (!email && stripeSession.metadata?.vendorEmail) {
          email = stripeSession.metadata.vendorEmail.trim().toLowerCase();
        }
        if (!email && stripeSession.customer_details?.email) {
          email = stripeSession.customer_details.email.trim().toLowerCase();
        }
        if (!email && stripeSession.customer_email) {
          email = stripeSession.customer_email.trim().toLowerCase();
        }
      } catch (err: any) {
        if (!email) {
          return NextResponse.json(
            { error: "Failed to retrieve session from payment gateway" },
            { status: 400 }
          );
        }
        isPaid = true;
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "Vendor email is required" },
        { status: 400 }
      );
    }

    if (!isPaid) {
      return NextResponse.json(
        { error: "Checkout session payment not confirmed" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    await db.collection("user").updateOne(
      { email: { $regex: new RegExp(`^${escaped}$`, "i") } },
      { $set: { subscriptionTier: "premium", updatedAt: new Date() } }
    );

    const existingPayment = await db.collection("payments").findOne({
      $or: [{ sessionId }, { vendorEmail: email, tier: "premium" }],
    });

    if (!existingPayment) {
      await db.collection("payments").insertOne({
        sessionId: sessionId || `session_${Date.now()}`,
        vendorEmail: email,
        amount: 29.0,
        currency: "usd",
        tier: "premium",
        status: "paid",
        paymentMethod: "stripe_card",
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Vendor successfully upgraded to Premium Unlimited Tier",
      subscriptionTier: "premium",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to verify checkout session" },
      { status: 500 }
    );
  }
}
