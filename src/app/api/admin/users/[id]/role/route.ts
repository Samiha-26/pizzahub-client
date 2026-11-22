import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (!["customer", "vendor", "admin"].includes(role)) {
      return NextResponse.json({ error: "Role must be customer, vendor, or admin" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(id) },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User role changed to ${role}`,
      role,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}
