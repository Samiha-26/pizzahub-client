import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const crust = searchParams.get("crust");
    const sort = searchParams.get("sort");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12", 10));

    const filter: any = {
      moderationStatus: { $ne: "hidden" },
    };

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { itemName: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { vendorName: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { vendorAddress: { $regex: q, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (crust && crust !== "All") {
      filter.crust = { $regex: new RegExp(`^${crust}$`, "i") };
    }

    const sortOptions: any = {};
    if (sort === "price-asc") {
      sortOptions.price = 1;
    } else if (sort === "price-desc") {
      sortOptions.price = -1;
    } else if (sort === "rating-desc") {
      sortOptions.rating = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const db = await getDb();
    const total = await db.collection("menu").countDocuments(filter);
    const items = await db
      .collection("menu")
      .find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}
