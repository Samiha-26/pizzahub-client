import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URL as string);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || "pizzahub");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const vendorEmail = body.vendorEmail;

    if (!vendorEmail) {
      return NextResponse.json({ error: "Vendor email is required" }, { status: 400 });
    }

    const email = vendorEmail.trim().toLowerCase();
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const db = await getDb();

    await db.collection("user").updateOne(
      { email: { $regex: new RegExp(`^${escaped}$`, "i") } },
      { $set: { subscriptionTier: "free", updatedAt: new Date() } }
    );

    await db.collection("payments").insertOne({
      vendorEmail: email,
      amount: 0,
      currency: "usd",
      tier: "free",
      status: "unsubscribed",
      type: "downgrade",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Successfully downgraded to Free Artisan Tier",
      subscriptionTier: "free",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process unsubscribe request" },
      { status: 500 }
    );
  }
}
