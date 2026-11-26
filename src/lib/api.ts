import { PizzaItem } from "@/components/shared/PizzaCard";
import { ALL_PIZZAS_CATALOG } from "@/data/catalogPizzas";

export const resolveApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_API_URL.trim();
  }
  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost") {
      return "http://localhost:5000";
    }
    return "https://pizzahub-server-e1iu7w6uw-samiha1.vercel.app";
  }
  return "https://pizzahub-server-e1iu7w6uw-samiha1.vercel.app";
};

export const API_BASE_URL = resolveApiBaseUrl();

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
    const res = await fetch("/api/menu/specials", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapMongoPizzaToItem);
      }
    }
  } catch {}

  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/menu/specials`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapMongoPizzaToItem);
      }
    }
    return ALL_PIZZAS_CATALOG.slice(0, 6);
  } catch {
    return ALL_PIZZAS_CATALOG.slice(0, 6);
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
  const query = new URLSearchParams();
  if (params.search && params.search.trim() !== "") query.append("search", params.search.trim());
  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.crust && params.crust !== "All") query.append("crust", params.crust);
  if (params.sort) query.append("sort", params.sort);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());

  try {
    const res = await fetch(`/api/menu?${query.toString()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        return {
          items: data.items.map(mapMongoPizzaToItem),
          total: data.total || 0,
          page: data.page || 1,
          totalPages: data.totalPages || 1,
        };
      }
    }
  } catch {}

  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/menu?${query.toString()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return {
        items: Array.isArray(data.items) ? data.items.map(mapMongoPizzaToItem) : [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1,
      };
    }
  } catch {}

  let filtered = [...ALL_PIZZAS_CATALOG];
  if (params.search && params.search.trim()) {
    const lower = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.itemName.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.vendorName.toLowerCase().includes(lower)
    );
  }
  if (params.category && params.category !== "All") {
    const lowerCat = params.category.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.category.toLowerCase().includes(lowerCat) ||
        lowerCat.includes(p.category.toLowerCase())
    );
  }
  if (params.crust && params.crust !== "All") {
    const lowerCrust = params.crust.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.crust.toLowerCase().includes(lowerCrust) ||
        lowerCrust.includes(p.crust.toLowerCase())
    );
  }
  if (params.sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (params.sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (params.sort === "rating-desc") {
    filtered.sort((a, b) => b.rating - a.rating);
  }
  return {
    items: filtered,
    total: filtered.length,
    page: 1,
    totalPages: 1,
  };
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
  const mapDoc = (doc: any): PizzaDetail => ({
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
  });

  try {
    const res = await fetch(`/api/menu/${id}`, { cache: "no-store" });
    if (res.ok) {
      const doc = await res.json();
      return mapDoc(doc);
    }
  } catch {}

  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/menu/${id}`, { cache: "no-store" });
    if (res.ok) {
      const doc = await res.json();
      return mapDoc(doc);
    }
  } catch {}

  const local = ALL_PIZZAS_CATALOG.find((p) => p.id === id) || ALL_PIZZAS_CATALOG[0];
  if (local) {
    return {
      id: local.id,
      name: local.itemName,
      tagline: "Authentic Stone-Baked Creation",
      description: local.description,
      price: local.price,
      crust: local.crust,
      category: local.category,
      image: local.image,
      images: [local.image],
      badges: [local.badge || "IN PREMIUM WOOD-FIRE"],
      rating: local.rating,
      reviewCount: 120,
      ingredients: ["San Marzano Tomatoes", "Fior di Latte Mozzarella", "Fresh Basil", "Cold-Pressed EVOO"],
      prepTimeMinutes: parseInt(local.timeEstimate || "15", 10) || 15,
      calories: 850,
      vendorName: local.vendorName,
      vendorEmail: "orders@pizzahub.com",
      vendorAddress: local.location,
    };
  }
  return null;
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
  location?: string;
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
  location?: string;
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
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`/api/orders/my-orders/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}

  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/orders/my-orders/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  return [];
}

export async function cancelOrder(id: string) {
  try {
    const res = await fetch(`/api/orders/${id}/cancel`, {
      method: "PATCH",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/${id}/cancel`, {
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
    const res = await fetch(`/api/vendor/stats/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/vendor/stats/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

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

export async function getVendorMenu(email: string): Promise<VendorMenuResponse> {
  const mapData = (data: any): VendorMenuResponse => ({
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
  });

  try {
    const res = await fetch(`/api/vendor/menu/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return mapData(data);
    }
  } catch {}

  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/vendor/menu/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return mapData(data);
    }
  } catch {}

  return {
    items: [],
    subscriptionTier: "free",
    itemCount: 0,
    itemLimit: 3,
    canAddMore: true,
  };
}

export async function createVendorPizza(payload: Record<string, unknown>) {
  try {
    const res = await fetch("/api/vendor/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json().catch(() => ({}));
    if (res.status === 403 || res.status === 400) {
      throw new Error(errData.error || "Failed to create pizza item");
    }
  } catch (err: any) {
    if (err.message && (err.message.includes("limit") || err.message.includes("suspended") || err.message.includes("Missing"))) {
      throw err;
    }
  }

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/vendor/menu`, {
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
  try {
    const res = await fetch(`/api/vendor/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/vendor/menu/${id}`, {
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
  try {
    const res = await fetch(`/api/vendor/menu/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/vendor/menu/${id}`, {
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
    const res = await fetch(`/api/vendor/orders/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/vendor/orders/${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  return [];
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const res = await fetch(`/api/vendor/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/vendor/orders/${id}/status`, {
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
  try {
    const res = await fetch("/api/vendor/verify-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, vendorEmail }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/vendor/verify-session`, {
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

export async function unsubscribeVendorPremium(vendorEmail: string): Promise<{ success: boolean; message: string; subscriptionTier: string }> {
  try {
    const res = await fetch("/api/vendor/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorEmail }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const resServer = await fetch(`${baseUrl}/api/vendor/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vendorEmail }),
  });
  const data = await resServer.json().catch(() => ({}));
  if (!resServer.ok) {
    throw new Error(data.error || "Failed to unsubscribe from premium");
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
  sessionId?: string;
  vendorEmail: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  createdAt: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch admin statistics");
  return await res.json();
}

export async function getAdminUsers(params?: { search?: string; role?: string; status?: string }): Promise<AdminUser[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.role && params.role !== "all") query.set("role", params.role);
  if (params?.status && params.status !== "all") query.set("status", params.status);

  try {
    const res = await fetch(`/api/admin/users?${query.toString()}`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/users?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch platform users");
  return await res.json();
}

export async function updateUserStatus(id: string, status: "active" | "blocked") {
  try {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/users/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update user status");
  return data;
}

export async function updateUserRole(id: string, role: "customer" | "vendor" | "admin") {
  try {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/users/${id}/role`, {
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

  try {
    const res = await fetch(`/api/admin/menu?${query.toString()}`, { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/menu?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch admin menu");
  return await res.json();
}

export async function updateMenuModeration(id: string, moderationStatus: "approved" | "flagged" | "hidden") {
  try {
    const res = await fetch(`/api/admin/menu/${id}/moderation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moderationStatus }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/menu/${id}/moderation`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moderationStatus }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update recipe moderation");
  return data;
}

export async function deleteAdminMenuItem(id: string) {
  try {
    const res = await fetch(`/api/admin/menu/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/menu/${id}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to delete recipe");
  return data;
}

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  try {
    const res = await fetch("/api/admin/transactions", { cache: "no-store" });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const baseUrl = resolveApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/transactions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch transaction ledger");
  return await res.json();
}
