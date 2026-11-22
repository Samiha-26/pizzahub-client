import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const specials = await db
      .collection("menu")
      .find({ moderationStatus: { $ne: "hidden" } })
      .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
      .limit(6)
      .toArray();

    return NextResponse.json(specials);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch chef specials" },
      { status: 500 }
    );
  }
}
