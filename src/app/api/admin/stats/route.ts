import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();

    const totalUsers = await db.collection("user").countDocuments();
    const totalVendors = await db.collection("user").countDocuments({ role: "vendor" });
    const totalCustomers = await db.collection("user").countDocuments({ role: "customer" });
    const totalPizzas = await db.collection("menu").countDocuments();
    const totalOrders = await db.collection("orders").countDocuments();

    const completedOrders = await db
      .collection("orders")
      .find({ status: { $in: ["delivered", "completed"] } })
      .toArray();
    const ordersRevenue = completedOrders.reduce((sum, o: any) => sum + (Number(o.totalPrice) || 0), 0);

    const subscriptionPayments = await db
      .collection("payments")
      .find({ status: "completed" })
      .toArray();
    const subscriptionRevenue = subscriptionPayments.reduce((sum, p: any) => sum + (Number(p.amount) || 0), 0);

    const totalRevenue = ordersRevenue + subscriptionRevenue;

    return NextResponse.json({
      totalUsers,
      totalVendors,
      totalCustomers,
      totalPizzas,
      totalOrders,
      ordersRevenue: Number(ordersRevenue.toFixed(2)),
      subscriptionRevenue: Number(subscriptionRevenue.toFixed(2)),
      totalRevenue: Number(totalRevenue.toFixed(2)),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch platform metrics" },
      { status: 500 }
    );
  }
}
