import { PizzaItem } from "@/components/shared/PizzaCard";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function mapMongoPizzaToItem(doc: any): PizzaItem {
  const primaryBadge = Array.isArray(doc.badges) && doc.badges.length > 0 ? doc.badges[0] : doc.badge;
  const isTop = typeof primaryBadge === "string" && primaryBadge.includes("TOP");

  return {
    id: doc._id?.toString() || doc.id || "",
    itemName: doc.name || doc.itemName || "Artisan Pizza",
    category: doc.category || "WOOD-FIRED",
    description: doc.description || "",
    price: Number(doc.price) || 0,
    location: doc.vendorAddress || doc.location || "Artisan Hearth, Dhaka",
    vendorName: doc.vendorName || "Master Pizzaiolo",
    image: doc.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    badge: primaryBadge || "IN PREMIUM WOOD-FIRE",
    badgeType: isTop ? "top" : "premium",
    timeEstimate: doc.prepTimeMinutes ? `${doc.prepTimeMinutes} min` : "20 min",
  };
}

export async function getChefSpecials(): Promise<PizzaItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/menu/specials`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(mapMongoPizzaToItem);
    }
    return [];
  } catch {
    return [];
  }
}

export interface MenuQueryParams {
  search?: string;
  category?: string;
  crust?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface MenuResponse {
  items: PizzaItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getMenu(params: MenuQueryParams = {}): Promise<MenuResponse> {
  try {
    const query = new URLSearchParams();
    if (params.search && params.search.trim() !== "") query.append("search", params.search.trim());
    if (params.category && params.category !== "All") query.append("category", params.category);
    if (params.crust && params.crust !== "All") query.append("crust", params.crust);
    if (params.sort) query.append("sort", params.sort);
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());

    const res = await fetch(`${API_BASE_URL}/api/menu?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return {
      items: Array.isArray(data.items) ? data.items.map(mapMongoPizzaToItem) : [],
      total: data.total || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1,
    };
  } catch {
    return {
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
    };
  }
}

export interface PizzaDetail {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  price: number;
  crust: string;
  category: string;
  image: string;
  images: string[];
  badges: string[];
  rating: number;
  reviewCount: number;
  ingredients: string[];
  prepTimeMinutes: number;
  calories: number;
  vendorId?: string;
  vendorName: string;
  vendorEmail?: string;
  vendorAddress: string;
}

export async function getPizzaById(id: string): Promise<PizzaDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch pizza: ${res.status}`);
    }

    const doc = await res.json();
    return {
      id: doc._id?.toString() || doc.id || id,
      name: doc.name || doc.itemName || "Artisan Pizza",
      tagline: doc.tagline || "Authentic Stone-Baked Creation",
      description: doc.description || "",
      price: Number(doc.price) || 0,
      crust: doc.crust || "Neapolitan 48h",
      category: doc.category || "Wood-Fired",
      image: doc.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
      images: Array.isArray(doc.images) && doc.images.length > 0 ? doc.images : [doc.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80"],
      badges: Array.isArray(doc.badges) ? doc.badges : ["IN PREMIUM WOOD-FIRE"],
      rating: Number(doc.rating) || 4.9,
      reviewCount: Number(doc.reviewCount) || 120,
      ingredients: Array.isArray(doc.ingredients) ? doc.ingredients : ["San Marzano Tomatoes", "Fior di Latte Mozzarella", "Fresh Basil", "EVOO"],
      prepTimeMinutes: Number(doc.prepTimeMinutes) || 15,
      calories: Number(doc.calories) || 850,
      vendorId: doc.vendorId,
      vendorName: doc.vendorName || "Artisan Hearth Master",
      vendorEmail: doc.vendorEmail || "orders@pizzahub.com",
      vendorAddress: doc.vendorAddress || "Gulshan-2 Culinary Circle, Dhaka",
    };
  } catch {
    return null;
  }
}

export interface OrderItemPayload {
  customerEmail: string;
  customerName: string;
  pizzaId: string;
  pizzaName: string;
  pizzaImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
  crust: string;
  category: string;
  vendorId?: string;
  vendorName: string;
  deliveryAddress: string;
  deliverySchedule: string;
  bakerNote?: string;
}

export interface OrderRecord {
  _id: string;
  customerEmail: string;
  customerName: string;
  pizzaId?: string;
  pizzaName: string;
  pizzaImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
  crust: string;
  category: string;
  vendorId?: string;
  vendorName: string;
  deliveryAddress: string;
  deliverySchedule: string;
  bakerNote?: string;
  status: "pending" | "preparing" | "on_the_way" | "delivered" | "cancelled";
  timeline?: {
    step: string;
    time: string | null;
    completed: boolean;
  }[];
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
}

export async function createOrder(payload: OrderItemPayload) {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to place pizza order");
  }

  return await res.json();
}

export async function getMyOrders(email: string): Promise<OrderRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/my-orders/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.status}`);
    }

    return await res.json();
  } catch {
    return [];
  }
}

export async function cancelOrder(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/orders/${id}/cancel`, {
    method: "PATCH",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to cancel order");
  }

  return await res.json();
}
