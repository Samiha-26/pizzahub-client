import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const filter: any = {};

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { itemName: { $regex: search.trim(), $options: "i" } },
        { vendorName: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    const db = await getDb();
    const items = await db
      .collection("menu")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = items.map((item: any) => ({
      id: item._id.toString(),
      itemName: item.name || item.itemName || "Untitled Pizza",
      category: item.category || "Specialty",
      price: Number(item.price) || 0,
      vendorName: item.vendorName || "Artisan Hearth Pizzeria",
      vendorEmail: item.vendorEmail || "",
      location: item.location || item.vendorAddress || "Little Italy, Manhattan, NY",
      image: item.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
      badge: Array.isArray(item.badges) && item.badges.length > 0 ? item.badges[0] : item.badge || null,
      moderationStatus: item.moderationStatus || "approved",
      createdAt: item.createdAt || new Date(),
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch moderation menu" },
      { status: 500 }
    );
  }
}
