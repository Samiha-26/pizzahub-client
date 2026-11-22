import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const transactions = await db
      .collection("payments")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch transaction ledger" },
      { status: 500 }
    );
  }
}
