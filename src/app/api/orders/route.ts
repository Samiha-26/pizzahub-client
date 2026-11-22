import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URL as string);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || "pizzahub");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerEmail,
      customerName,
      pizzaId,
      pizzaName,
      pizzaImage,
      price,
      quantity = 1,
      totalPrice,
      crust,
      category,
      vendorId,
      vendorName,
      deliveryAddress,
      deliverySchedule,
      bakerNote,
    } = body;

    if (!customerEmail || !deliveryAddress) {
      return NextResponse.json(
        { error: "Missing required order details: customerEmail and deliveryAddress are mandatory" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const calculatedTotal = totalPrice || (Number(price) || 0) * (Number(quantity) || 1);

    const newOrder = {
      customerEmail: customerEmail.trim().toLowerCase(),
      customerName: customerName || "Pizza Enthusiast",
      pizzaId: pizzaId ? pizzaId.toString() : null,
      pizzaName: pizzaName || "Artisan Pizza",
      pizzaImage: pizzaImage || "",
      price: Number(price) || 0,
      quantity: Number(quantity) || 1,
      totalPrice: Number(calculatedTotal),
      crust: crust || "Neapolitan 48h",
      category: category || "Wood-Fired",
      vendorId: vendorId || "vendor_artisan_01",
      vendorName: vendorName || "Forno Antico Pizzeria",
      deliveryAddress: deliveryAddress.trim(),
      deliverySchedule: deliverySchedule || "ASAP (25–35 min hearth dispatch)",
      bakerNote: bakerNote ? bakerNote.trim() : "",
      status: "pending",
      timeline: [
        {
          step: "Order Placed",
          time: new Date().toISOString(),
          completed: true,
        },
        {
          step: "Hearth Wood-Firing",
          time: null,
          completed: false,
        },
        {
          step: "Thermal Transit",
          time: null,
          completed: false,
        },
        {
          step: "Delivered Hot",
          time: null,
          completed: false,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(newOrder);

    await db.collection("notifications").insertOne({
      recipientEmail: customerEmail.trim().toLowerCase(),
      title: "Wood-Fired Order Placed",
      message: `Your artisanal order for "${newOrder.pizzaName}" has been dispatched to the master pizzaiolo.`,
      type: "order",
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Artisan order placed successfully",
        insertedId: result.insertedId,
        order: { ...newOrder, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to place order", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error.message },
      { status: 500 }
    );
  }
}
