import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
    }

    const db = await getDb();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending orders can be cancelled. Hearth baking is already underway." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "cancelled",
          cancelledAt: now,
          updatedAt: new Date(),
        },
      }
    );

    const updated = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      message: "Order cancelled successfully",
      order: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
