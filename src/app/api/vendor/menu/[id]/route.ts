import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const decoded = decodeURIComponent(rawId).trim();
    const db = await getDb();

    if (decoded.includes("@")) {
      const email = decoded.toLowerCase();
      const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const emailRegex = new RegExp(`^${escaped}$`, "i");

      const user = await db.collection("user").findOne({ email: { $regex: emailRegex } });
      const subscriptionTier = user?.subscriptionTier || "free";
      const itemLimit = subscriptionTier === "premium" ? null : 3;

      const items = await db
        .collection("menu")
        .find({ vendorEmail: { $regex: emailRegex } })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({
        items,
        subscriptionTier,
        itemCount: items.length,
        itemLimit,
        canAddMore: subscriptionTier === "premium" || items.length < 3,
      });
    }

    if (!ObjectId.isValid(decoded)) {
      return NextResponse.json({ error: "Invalid pizza ID format" }, { status: 400 });
    }

    const pizza = await db.collection("menu").findOne({ _id: new ObjectId(decoded) });
    if (!pizza) {
      return NextResponse.json({ error: "Pizza item not found" }, { status: 404 });
    }

    return NextResponse.json(pizza);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch vendor menu item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid pizza ID format" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      tagline,
      description,
      price,
      crust,
      category,
      image,
      images,
      ingredients,
      prepTimeMinutes,
      calories,
      badges,
      vendorEmail,
    } = body;

    const db = await getDb();
    const query = { _id: new ObjectId(id) };
    const existing = await db.collection("menu").findOne(query);

    if (!existing) {
      return NextResponse.json({ error: "Pizza item not found" }, { status: 404 });
    }

    if (vendorEmail && existing.vendorEmail) {
      if (existing.vendorEmail.toLowerCase() !== vendorEmail.trim().toLowerCase()) {
        return NextResponse.json({ error: "Unauthorized to modify this menu item" }, { status: 403 });
      }
    }

    const parsedIngredients = Array.isArray(ingredients)
      ? ingredients
      : typeof ingredients === "string"
      ? ingredients.split(",").map((s) => s.trim()).filter(Boolean)
      : existing.ingredients;

    const updateFields: any = {
      ...(name && { name: name.trim() }),
      ...(tagline !== undefined && { tagline: tagline.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(crust && { crust }),
      ...(category && { category }),
      ...(image && { image: image.trim() }),
      ...(Array.isArray(images) && images.length > 0 && { images }),
      ingredients: parsedIngredients,
      ...(prepTimeMinutes !== undefined && { prepTimeMinutes: Number(prepTimeMinutes) }),
      ...(calories !== undefined && { calories: Number(calories) }),
      ...(Array.isArray(badges) && { badges }),
      updatedAt: new Date(),
    };

    await db.collection("menu").updateOne(query, { $set: updateFields });
    const updated = await db.collection("menu").findOne(query);

    return NextResponse.json({
      message: "Artisan pizza updated successfully",
      item: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update artisan pizza" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid pizza ID format" }, { status: 400 });
    }

    const db = await getDb();
    const query = { _id: new ObjectId(id) };
    const existing = await db.collection("menu").findOne(query);

    if (!existing) {
      return NextResponse.json({ error: "Pizza item not found" }, { status: 404 });
    }

    await db.collection("menu").deleteOne(query);
    return NextResponse.json({
      message: "Artisan pizza deleted successfully",
      id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete artisan pizza" },
      { status: 500 }
    );
  }
}
