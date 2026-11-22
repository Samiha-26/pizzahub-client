import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid menu item ID" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("menu").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Recipe removed by administrator",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
