import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
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
      vendorName,
      vendorAddress,
    } = body;

    if (!name || !price || !vendorEmail || !image) {
      return NextResponse.json(
        { error: "Missing required menu fields: name, price, vendorEmail, and image are mandatory" },
        { status: 400 }
      );
    }

    const email = vendorEmail.trim().toLowerCase();
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const emailRegex = new RegExp(`^${escaped}$`, "i");

    const db = await getDb();
    const user = await db.collection("user").findOne({ email: { $regex: emailRegex } });

    if (user && user.status === "blocked") {
      return NextResponse.json(
        { error: "Your vendor account has been suspended by administration. You cannot publish menu items." },
        { status: 403 }
      );
    }

    const subscriptionTier = user?.subscriptionTier || "free";

    if (subscriptionTier !== "premium") {
      const currentCount = await db.collection("menu").countDocuments({
        vendorEmail: { $regex: emailRegex },
      });

      if (currentCount >= 3) {
        return NextResponse.json(
          {
            error: "Free tier vendor limit reached (3/3 items). Upgrade to Premium for unlimited hearth slots.",
            code: "UPGRADE_REQUIRED",
            currentCount,
            limit: 3,
          },
          { status: 403 }
        );
      }
    }

    const parsedIngredients = Array.isArray(ingredients)
      ? ingredients
      : typeof ingredients === "string"
      ? ingredients.split(",").map((s) => s.trim()).filter(Boolean)
      : ["San Marzano Tomatoes", "Fior di Latte Mozzarella", "EVOO"];

    const newPizza = {
      name: name.trim(),
      tagline: tagline ? tagline.trim() : "Artisan Stone-Baked Creation",
      description: description ? description.trim() : "",
      price: Number(price) || 0,
      crust: crust || "Neapolitan 48h",
      category: category || "Wood-Fired",
      image: image.trim(),
      images: Array.isArray(images) && images.length > 0 ? images : [image.trim()],
      ingredients: parsedIngredients,
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      calories: Number(calories) || 850,
      badges: Array.isArray(badges) && badges.length > 0 ? badges : ["ARTISAN SPECIAL", "IN PREMIUM WOOD-FIRE"],
      rating: 5.0,
      reviewCount: 0,
      status: "active",
      vendorId: user?._id?.toString() || `vendor_${Date.now()}`,
      vendorEmail: email,
      vendorName: vendorName ? vendorName.trim() : "Artisan Pizzeria",
      vendorAddress: vendorAddress ? vendorAddress.trim() : "PizzaHub Kitchen Hub",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("menu").insertOne(newPizza);

    return NextResponse.json(
      {
        message: "Artisan pizza created successfully",
        item: { ...newPizza, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create artisan pizza" },
      { status: 500 }
    );
  }
}
