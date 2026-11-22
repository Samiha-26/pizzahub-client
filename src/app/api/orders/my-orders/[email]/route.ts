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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    const decodedEmail = decodeURIComponent(email).trim().toLowerCase();
    const db = await getDb();

    const orders = await db
      .collection("orders")
      .find({ customerEmail: decodedEmail })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch customer orders", details: error.message },
      { status: 500 }
    );
  }
}
