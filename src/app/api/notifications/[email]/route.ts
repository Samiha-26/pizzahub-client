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

    const notifications = await db
      .collection("notifications")
      .find({ recipientEmail: decodedEmail })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    if (notifications.length === 0) {
      const welcomeNotification = {
        recipientEmail: decodedEmail,
        title: "Welcome to PizzaHub Artisanal Hearth",
        message: "Your wood-fired artisanal journey has begun. Discover authentic 72-hour sourdough pies crafted by master pizzaiolos.",
        type: "system",
        read: false,
        createdAt: new Date(),
      };
      const result = await db.collection("notifications").insertOne(welcomeNotification);
      return NextResponse.json({
        notifications: [{ ...welcomeNotification, _id: result.insertedId }],
        unreadCount: 1,
      });
    }

    const unreadCount = notifications.filter((n: any) => !n.read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: err.message },
      { status: 500 }
    );
  }
}
