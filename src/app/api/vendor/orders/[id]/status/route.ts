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

    const validStatuses = ["pending", "preparing", "on_the_way", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
    }

    const db = await getDb();
    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updatedTimeline = (order.timeline || []).map((step: any) => {
      if (status === "preparing") {
        if (step.step === "Hearth Wood-Firing" || step.step === "Order Placed") {
          return { ...step, completed: true, time: step.time || now };
        }
      } else if (status === "on_the_way") {
        if (
          step.step === "Thermal Transit" ||
          step.step === "Hearth Wood-Firing" ||
          step.step === "Order Placed"
        ) {
          return { ...step, completed: true, time: step.time || now };
        }
      } else if (status === "delivered") {
        return { ...step, completed: true, time: step.time || now };
      }
      return step;
    });

    await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          timeline: updatedTimeline,
          updatedAt: new Date(),
          ...(status === "cancelled" && { cancelledAt: now }),
        },
      }
    );

    const updatedOrder = await db.collection("orders").findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
