import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { auth } from "@/lib/auth";

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URL as string);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || "pizzahub");
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = await getDb();
    const userDoc = await db.collection("user").findOne({
      email: { $regex: new RegExp(`^${session.user.email}$`, "i") },
    });
    return NextResponse.json({
      name: userDoc?.name || session.user.name || "",
      email: session.user.email,
      image: userDoc?.image || session.user.image || "",
      phone: userDoc?.phone || "",
      street: userDoc?.street || "",
      cityArea: userDoc?.cityArea || "Little Italy, Manhattan, NY",
      postalCode: userDoc?.postalCode || "10013",
      instructions: userDoc?.instructions || "",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const body = await req.json();
    const email = session?.user?.email || body.email;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized or missing email" }, { status: 401 });
    }

    const {
      name,
      phone,
      avatarUrl,
      image,
      street,
      cityArea,
      postalCode,
      instructions,
    } = body;

    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (typeof name === "string") updateFields.name = name.trim();
    if (typeof phone === "string") updateFields.phone = phone.trim();
    if (typeof avatarUrl === "string" && avatarUrl.trim()) updateFields.image = avatarUrl.trim();
    else if (typeof image === "string" && image.trim()) updateFields.image = image.trim();
    if (typeof street === "string") updateFields.street = street.trim();
    if (typeof cityArea === "string") updateFields.cityArea = cityArea.trim();
    if (typeof postalCode === "string") updateFields.postalCode = postalCode.trim();
    if (typeof instructions === "string") updateFields.instructions = instructions.trim();

    const db = await getDb();
    await db.collection("user").updateOne(
      { email: { $regex: new RegExp(`^${email}$`, "i") } },
      { $set: updateFields }
    );

    const updatedUser = await db.collection("user").findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser?.name || name,
        email: updatedUser?.email || email,
        image: updatedUser?.image || avatarUrl || image,
        phone: updatedUser?.phone || phone,
        street: updatedUser?.street || street,
        cityArea: updatedUser?.cityArea || cityArea,
        postalCode: updatedUser?.postalCode || postalCode,
        instructions: updatedUser?.instructions || instructions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
