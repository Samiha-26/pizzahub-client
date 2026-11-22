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
    const { status } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (!["active", "blocked"].includes(status)) {
      return NextResponse.json({ error: "Status must be active or blocked" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User status changed to ${status}`,
      status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update user status" },
      { status: 500 }
    );
  }
}
