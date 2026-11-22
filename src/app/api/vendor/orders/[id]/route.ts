import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawParam } = await params;
    const email = decodeURIComponent(rawParam).trim().toLowerCase();
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const emailRegex = new RegExp(`^${escaped}$`, "i");

    const db = await getDb();
    const specificOrders = await db
      .collection("orders")
      .find({
        $or: [
          { vendorEmail: { $regex: emailRegex } },
          { vendorId: email },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    const orders =
      specificOrders.length > 0
        ? specificOrders
        : await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch vendor kitchen orders" },
      { status: 500 }
    );
  }
}
