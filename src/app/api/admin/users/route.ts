import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const filter: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      filter.role = role.toLowerCase();
    }

    if (status && status !== "all") {
      filter.status = status.toLowerCase();
    }

    const db = await getDb();
    const users = await db
      .collection("user")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const mappedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name || "Anonymous Artisan",
      email: u.email,
      role: u.role || "customer",
      status: u.status || "active",
      subscriptionTier: u.subscriptionTier || "free",
      createdAt: u.createdAt || new Date(),
      image: u.image || null,
    }));

    return NextResponse.json(mappedUsers);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch platform users" },
      { status: 500 }
    );
  }
}
