import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { moderationStatus } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid menu item ID" }, { status: 400 });
    }

    if (!["approved", "flagged", "hidden"].includes(moderationStatus)) {
      return NextResponse.json(
        { error: "Moderation status must be approved, flagged, or hidden" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection("menu").updateOne(
      { _id: new ObjectId(id) },
      { $set: { moderationStatus, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Recipe marked as ${moderationStatus}`,
      moderationStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update recipe moderation" },
      { status: 500 }
    );
  }
}
