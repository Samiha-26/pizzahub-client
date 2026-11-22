import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: rawEmail } = await params;
    const email = decodeURIComponent(rawEmail).trim().toLowerCase();
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const emailRegex = new RegExp(`^${escaped}$`, "i");

    const db = await getDb();
    const user = await db.collection("user").findOne({ email: { $regex: emailRegex } });

    const subscriptionTier = user?.subscriptionTier || "free";
    const itemLimit = subscriptionTier === "premium" ? null : 3;

    const itemCount = await db.collection("menu").countDocuments({
      vendorEmail: { $regex: emailRegex },
    });

    const vendorOrders = await db.collection("orders").find({
      $or: [
        { vendorEmail: { $regex: emailRegex } },
        { vendorId: email },
      ],
    }).toArray();

    const effectiveOrders = vendorOrders.length > 0 ? vendorOrders : await db.collection("orders").find({}).toArray();

    const totalOrders = effectiveOrders.length;
    const pendingOrders = effectiveOrders.filter((o) => o.status === "pending").length;
    const totalRevenue = effectiveOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    return NextResponse.json({
      subscriptionTier,
      itemCount,
      itemLimit,
      canAddMore: subscriptionTier === "premium" || itemCount < 3,
      totalOrders,
      pendingOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch vendor statistics" },
      { status: 500 }
    );
  }
}
