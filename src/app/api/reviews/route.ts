import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pizzaId, customerName, customerEmail, rating, comment } = body;

    if (!pizzaId || !customerEmail || !rating || !comment) {
      return NextResponse.json({ error: "Missing required review fields" }, { status: 400 });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
    }

    const db = await getDb();
    const newReview = {
      pizzaId: pizzaId.toString(),
      customerName: (customerName || "Artisan Foodie").trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      rating: numRating,
      comment: comment.trim(),
      isVerifiedBuyer: true,
      createdAt: new Date(),
    };

    const insertResult = await db.collection("reviews").insertOne(newReview);

    const allPizzaReviews = await db.collection("reviews").find({ pizzaId: pizzaId.toString() }).toArray();
    const totalCount = allPizzaReviews.length;
    const sum = allPizzaReviews.reduce((acc, r: any) => acc + Number(r.rating), 0);
    const newAverage = Number((sum / totalCount).toFixed(1));

    if (ObjectId.isValid(pizzaId)) {
      await db.collection("menu").updateOne(
        { _id: new ObjectId(pizzaId) },
        {
          $set: {
            rating: newAverage,
            reviewCount: totalCount,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review posted successfully",
        reviewId: insertResult.insertedId,
        averageRating: newAverage,
        reviewCount: totalCount,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
