import { PizzaItem } from "@/components/shared/PizzaCard";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatArtisanLocation(addr?: string): string {
  if (!addr) return "Little Italy, Manhattan, NY";
  if (/Banani/i.test(addr)) return "Williamsburg, Brooklyn, NY";
  if (/Dhanmondi/i.test(addr)) return "North Beach, San Francisco, CA";
  if (/Gulshan|Dhaka/i.test(addr)) return "Little Italy, Manhattan, NY";
  return addr;
}

export function mapMongoPizzaToItem(doc: any): PizzaItem {
  const primaryBadge = Array.isArray(doc.badges) && doc.badges.length > 0 ? doc.badges[0] : doc.badge;
  const isTop = typeof primaryBadge === "string" && primaryBadge.includes("TOP");

  return {
    id: doc._id?.toString() || doc.id || "",
    itemName: doc.name || doc.itemName || "Artisan Pizza",
    category: doc.category || "WOOD-FIRED",
    description: doc.description || "",
    price: Number(doc.price) || 0,
    location: formatArtisanLocation(doc.vendorAddress || doc.location),
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
      vendorAddress: formatArtisanLocation(doc.vendorAddress),
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

export interface VendorStats {
  subscriptionTier: "free" | "premium";
  itemCount: number;
  itemLimit: number | null;
  canAddMore: boolean;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export interface VendorMenuResponse {
  items: PizzaDetail[];
  subscriptionTier: "free" | "premium";
  itemCount: number;
  itemLimit: number | null;
  canAddMore: boolean;
}

export async function getVendorStats(email: string): Promise<VendorStats> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendor/stats/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch vendor statistics");
    return await res.json();
  } catch {
    return {
      subscriptionTier: "free",
      itemCount: 0,
      itemLimit: 3,
      canAddMore: true,
      totalOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
    };
  }
}

export async function getVendorMenu(email: string): Promise<VendorMenuResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendor/menu/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch vendor menu");
    const data = await res.json();
    return {
      items: Array.isArray(data.items)
        ? data.items.map((doc: any) => ({
            id: doc._id?.toString() || doc.id || "",
            name: doc.name || doc.itemName || "Artisan Pizza",
            tagline: doc.tagline || "",
            description: doc.description || "",
            price: Number(doc.price) || 0,
            crust: doc.crust || "Neapolitan 48h",
            category: doc.category || "Wood-Fired",
            image: doc.image || "",
            images: Array.isArray(doc.images) ? doc.images : [doc.image || ""],
            badges: Array.isArray(doc.badges) ? doc.badges : [],
            rating: Number(doc.rating) || 5.0,
            reviewCount: Number(doc.reviewCount) || 0,
            ingredients: Array.isArray(doc.ingredients) ? doc.ingredients : [],
            prepTimeMinutes: Number(doc.prepTimeMinutes) || 15,
            calories: Number(doc.calories) || 850,
            vendorId: doc.vendorId,
            vendorName: doc.vendorName || "Artisan Pizzeria",
            vendorEmail: doc.vendorEmail,
            vendorAddress: doc.vendorAddress || "Little Italy, Manhattan, NY",
          }))
        : [],
      subscriptionTier: data.subscriptionTier || "free",
      itemCount: data.itemCount || 0,
      itemLimit: data.itemLimit ?? (data.subscriptionTier === "premium" ? null : 3),
      canAddMore: data.canAddMore ?? (data.subscriptionTier === "premium" || (data.items?.length || 0) < 3),
    };
  } catch {
    return {
      items: [],
      subscriptionTier: "free",
      itemCount: 0,
      itemLimit: 3,
      canAddMore: true,
    };
  }
}

export async function createVendorPizza(payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/api/vendor/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to create pizza item");
  }
  return data;
}

export async function updateVendorPizza(id: string, payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE_URL}/api/vendor/menu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to update pizza item");
  }
  return data;
}

export async function deleteVendorPizza(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/vendor/menu/${id}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete pizza item");
  }
  return data;
}

export async function getVendorOrders(email: string): Promise<OrderRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/vendor/orders/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch kitchen orders");
    return await res.json();
  } catch {
    return [];
  }
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/api/vendor/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to update order status");
  }
  return data;
}

export async function createCheckoutSession(vendorEmail: string): Promise<{ url: string; sessionId?: string }> {
  const res = await fetch("/api/checkout_sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vendorEmail }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to initialize checkout session");
  }
  return data;
}

export async function verifyVendorUpgradeSession(sessionId: string, vendorEmail: string) {
  const res = await fetch(`${API_BASE_URL}/api/vendor/verify-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, vendorEmail }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to verify upgrade session");
  }
  return data;
}

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalPizzas: number;
  totalOrders: number;
  ordersRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  status: "active" | "blocked";
  subscriptionTier: "free" | "premium";
  createdAt: string;
  image?: string | null;
}

export interface AdminMenuItem {
  id: string;
  itemName: string;
  category: string;
  price: number;
  vendorName: string;
  vendorEmail: string;
  location: string;
  image: string;
  badge?: string | null;
  moderationStatus: "approved" | "flagged" | "hidden";
  createdAt: string;
}

export interface AdminTransaction {
  id?: string;
  _id?: string;
  transactionId?: string;
  vendorEmail: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  createdAt: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch admin statistics");
  return await res.json();
}

export async function getAdminUsers(params?: { search?: string; role?: string; status?: string }): Promise<AdminUser[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.role && params.role !== "all") query.set("role", params.role);
  if (params?.status && params.status !== "all") query.set("status", params.status);

  const res = await fetch(`${API_BASE_URL}/api/admin/users?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch platform users");
  return await res.json();
}

export async function updateUserStatus(id: string, status: "active" | "blocked") {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update user status");
  return data;
}

export async function updateUserRole(id: string, role: "customer" | "vendor" | "admin") {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update user role");
  return data;
}

export async function getAdminMenu(params?: { search?: string; category?: string }): Promise<AdminMenuItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category && params.category !== "all") query.set("category", params.category);

  const res = await fetch(`${API_BASE_URL}/api/admin/menu?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch admin menu");
  return await res.json();
}

export async function updateMenuModeration(id: string, moderationStatus: "approved" | "flagged" | "hidden") {
  const res = await fetch(`${API_BASE_URL}/api/admin/menu/${id}/moderation`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moderationStatus }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update recipe moderation");
  return data;
}

export async function deleteAdminMenuItem(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/admin/menu/${id}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to delete recipe");
  return data;
}

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/transactions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch transaction ledger");
  return await res.json();
}
