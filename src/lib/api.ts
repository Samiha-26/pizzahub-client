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
