import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pizzaId } = await params;
    const db = await getDb();

    const reviews = await db
      .collection("reviews")
      .find({ pizzaId })
      .sort({ createdAt: -1 })
      .toArray();

    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((acc, r: any) => acc + (Number(r.rating) || 0), 0);
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 5.0;

    const distribution = {
      5: reviews.filter((r: any) => Number(r.rating) === 5).length,
      4: reviews.filter((r: any) => Number(r.rating) === 4).length,
      3: reviews.filter((r: any) => Number(r.rating) === 3).length,
      2: reviews.filter((r: any) => Number(r.rating) === 2).length,
      1: reviews.filter((r: any) => Number(r.rating) === 1).length,
    };

    return NextResponse.json({
      pizzaId,
      totalReviews,
      averageRating,
      distribution,
      reviews,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch pizza reviews" },
      { status: 500 }
    );
  }
}
