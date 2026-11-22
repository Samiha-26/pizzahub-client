import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    let pizza = null;
    if (ObjectId.isValid(id)) {
      pizza = await db.collection("menu").findOne({ _id: new ObjectId(id) });
    }
    if (!pizza) {
      pizza = await db.collection("menu").findOne({ id });
    }

    if (!pizza) {
      return NextResponse.json({ error: "Pizza item not found" }, { status: 404 });
    }

    return NextResponse.json(pizza);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch pizza details" },
      { status: 500 }
    );
  }
}
