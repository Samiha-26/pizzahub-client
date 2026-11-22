import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URL as string);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || "pizzahub");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    const body = await req.json();

    const vendorEmail = session?.user?.email || body.vendorEmail;
    const vendorName = session?.user?.name || body.vendorName || "Kitchen Team";
    const message = body.message;

    if (!id || !message || !message.trim()) {
      return NextResponse.json(
        { error: "Review ID and reply message are required" },
        { status: 400 }
      );
    }

    const replyData = {
      vendorName: vendorName.trim(),
      vendorEmail: (vendorEmail || "").trim().toLowerCase(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    const db = await getDb();
    const query: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };

    await db.collection("reviews").updateOne(query, {
      $set: {
        reply: {
          ...replyData,
          createdAt: new Date(),
        },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kitchen reply posted successfully",
      reply: replyData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to post reply" },
      { status: 500 }
    );
  }
}
