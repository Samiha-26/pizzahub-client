"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChefHat,
  Upload,
  Link as LinkIcon,
  Crown,
  Flame,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sparkles,
  Info,
} from "lucide-react";
import { getVendorStats, createVendorPizza, type VendorStats } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

const CRUST_OPTIONS = [
  "Neapolitan 48h",
  "Roman Thin Crust",
  "Detroit Pan",
  "Gluten-Free Cauliflower",
  "Sourdough Stuffed",
];

const CATEGORY_OPTIONS = [
  "Wood-Fired",
  "Classic Italian",
  "White Base",
  "Spicy & Fiery",
  "Vegetarian & Plant",
];

const SAMPLE_PIZZAS = [
  {
    name: "Margherita D.O.P.",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Diavola Piccante",
    url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Truffle Porcini",
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Burrata Pistacchio",
    url: "https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function AddPizzaPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const user = session?.user;

  const [stats, setStats] = useState<VendorStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [crust, setCrust] = useState(CRUST_OPTIONS[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [ingredientsText, setIngredientsText] = useState(
    "San Marzano Tomatoes, Fior di Latte Mozzarella, Fresh Basil, EVOO"
  );
  const [prepTimeMinutes, setPrepTimeMinutes] = useState("15");
  const [calories, setCalories] = useState("850");
  const [badgeText, setBadgeText] = useState("ARTISAN SPECIAL");

  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadStats() {
      if (!user?.email) return;
      setIsLoadingStats(true);
      try {
        const data = await getVendorStats(user.email);
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setIsLoadingStats(false);
      }
    }

    if (user?.email) {
      loadStats();
    } else if (!isSessionPending) {
      setIsLoadingStats(false);
    }
  }, [user?.email, isSessionPending]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB");
      return;
    }

    setIsUploadingImage(true);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (apiKey) {
      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.data?.url) {
          setImageUrl(data.data.url);
          setImagePreview(data.data.url);
          toast.success("Image uploaded to ImgBB CDN!", { icon: "📸" });
          setIsUploadingImage(false);
          return;
        }
      } catch {
      }
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setImagePreview(result);
      setIsUploadingImage(false);
      toast.success("Image loaded and optimized for hearth listing!", { icon: "📸" });
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a pizza name");
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error("Please provide a valid price");
      return;
    }

    const finalImage = imageUrl.trim() || imagePreview.trim();
    if (!finalImage) {
      toast.error("Please upload or provide an image for your artisan pizza");
      return;
    }

    if (!user?.email) {
      toast.error("Please sign in to author pizzas");
      router.push("/signin");
      return;
    }

    if (!isPremium && (stats?.itemCount || 0) >= 3) {
      toast.error(
        "Free tier limit reached (3/3 items). Please upgrade to Premium for unlimited hearth slots.",
        { icon: "👑", duration: 6000 }
      );
      router.push("/vendor/upgrade");
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedIngredients = ingredientsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedBadges = badgeText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createVendorPizza({
        name: name.trim(),
        tagline: tagline.trim() || "Artisan Stone-Baked Creation",
        description: description.trim() || `${crust} base with artisanal toppings.`,
        price: Number(Number(price).toFixed(2)),
        crust,
        category,
        image: finalImage,
        images: [finalImage],
        ingredients: parsedIngredients,
        prepTimeMinutes: Number(prepTimeMinutes) || 15,
        calories: Number(calories) || 850,
        badges: parsedBadges.length > 0 ? parsedBadges : ["ARTISAN SPECIAL"],
        vendorEmail: user.email,
        vendorName: user.name || "Artisan Kitchen Master",
        vendorAddress: "PizzaHub Culinary Hub",
      });

      toast.success(`"${name}" successfully added to your wood-fired catalog!`, {
        icon: "🍕",
        duration: 5000,
      });

      router.push("/vendor/menu");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create pizza";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending || (isLoadingStats && user?.email)) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="w-9 h-9 animate-spin text-[#8E1616]" />
          <p className="text-sm font-semibold text-[#6E5F5B]">
            Verifying hearth quota and subscription slots...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#EBE4D8] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center mx-auto text-2xl font-black">
            <ChefHat className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#190F0E]">Vendor Sign In Required</h1>
          <p className="text-xs text-[#6E5F5B] leading-relaxed">
            Please log in with your vendor account to add recipes to your pizzeria catalog.
          </p>
          <button
            onClick={() => router.push("/signin?redirect=/vendor/add-pizza")}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#721111] text-white text-xs font-bold transition shadow-sm"
          >
            Sign In to Kitchen Portal
          </button>
        </div>
      </main>
    );
  }

  const isPremium = stats?.subscriptionTier === "premium";
  const isLimitReached = !isPremium && (stats?.itemCount || 0) >= 3;

  return (
    <main className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E5F5B] hover:text-[#8E1616] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Kitchen HQ
          </Link>

          {isPremium ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black shadow-2xs">
              <Crown className="w-3.5 h-3.5 fill-current" />
              PREMIUM VENDOR (UNLIMITED)
            </span>
          ) : (
            <span className="text-xs font-bold text-[#6E5F5B]">
              Free Tier: <strong className="text-[#190F0E]">{stats?.itemCount || 0} / 3 slots</strong> used
            </span>
          )}
        </div>

        {isLimitReached && (
          <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-950 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-black text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>Hearth Limit Reached (3 / 3 Items)</span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              Your free artisan pizzeria tier allows a maximum of 3 live menu listings. You have already filled all 3 slots. To publish additional stone-baked recipes, upgrade to the Premium Unlimited Tier.
            </p>
            <Link
              href="/vendor/upgrade"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold shadow-sm transition"
            >
              <Crown className="w-4 h-4 fill-current" />
              Upgrade to Premium for Unlimited Slots ($29/mo)
            </Link>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-[#EBE4D8] p-6 sm:p-8 shadow-2xs space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8E1616] uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Artisan Pizza Creation</span>
            </div>
            <h1 className="text-2xl font-black text-[#190F0E] tracking-tight">
              Create New Menu Item
            </h1>
            <p className="text-xs text-[#6E5F5B] mt-1">
              List your cold-fermented dough style, artisan toppings, and high-res ImgBB photography.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                Pizza Photo *
              </label>

              <div className="flex items-center gap-2 border-b border-[#EBE4D8] pb-2">
                <button
                  type="button"
                  onClick={() => setImageMode("file")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    imageMode === "file"
                      ? "bg-[#8E1616] text-white"
                      : "text-[#6E5F5B] hover:text-[#190F0E]"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Image File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    imageMode === "url"
                      ? "bg-[#8E1616] text-white"
                      : "text-[#6E5F5B] hover:text-[#190F0E]"
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Direct Image URL
                </button>
              </div>

              {imageMode === "file" ? (
                <div key="pizza-file-container" className="border-2 border-dashed border-[#EBE4D8] hover:border-[#8E1616]/40 rounded-2xl p-6 text-center transition bg-[#FAF7F2]/50">
                  <input
                    key="pizza-file-input"
                    type="file"
                    id="pizza-image-file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  <label
                    htmlFor="pizza-image-file"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin text-[#8E1616]" />
                        <span className="text-xs font-bold text-[#8E1616]">
                          Uploading photo...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-[#190F0E]">
                          Click to select pizza image from your device
                        </span>
                        <span className="text-[11px] text-[#6E5F5B]">
                          PNG, JPG, or WEBP up to 5MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div key="pizza-url-container" className="space-y-1.5">
                  <input
                    key="pizza-url-input"
                    type="url"
                    value={imageUrl ?? ""}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
                  />
                  <p className="text-[11px] text-[#6E5F5B]">
                    Paste a direct image link.
                  </p>
                </div>
              )}

              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#6E5F5B] block mb-1.5">
                  Or pick a verified sample artisan photo:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PIZZAS.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => {
                        setImageMode("url");
                        setImageUrl(sample.url);
                        setImagePreview(sample.url);
                        toast.success(`Selected "${sample.name}" photo!`, { icon: "🍕" });
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white border border-[#EBE4D8] hover:border-[#8E1616] text-[11px] font-bold text-[#190F0E] transition hover:bg-[#8E1616]/5 shadow-2xs"
                    >
                      🍕 {sample.name}
                    </button>
                  ))}
                </div>
              </div>

              {imagePreview && (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8]">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[#EBE4D8]">
                    <img
                      src={imagePreview}
                      alt="Pizza Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Image Ready for Hearth</span>
                    </div>
                    <p className="text-[11px] text-[#6E5F5B] truncate max-w-sm">
                      {imageUrl || "Local image staged for upload"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                  Pizza Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diavola al Miele Piccante"
                  className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 21.50"
                  className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                Artisan Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Calabrian Soppressata & Wild Mountain Hot Honey"
                className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                  Crust Fermentation *
                </label>
                <select
                  value={crust}
                  onChange={(e) => setCrust(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
                >
                  {CRUST_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                  Menu Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                Ingredients *
              </label>
              <textarea
                rows={2}
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="San Marzano Tomatoes, Fior di Latte Mozzarella, Calabrian Salami, Hot Honey, Fresh Basil"
                className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                Artisan Story / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Baked at 900°F in our volcanic stone hearth. Dough is cold-fermented for 48 hours for an airy, charred cornicione."
                className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                  Bake Prep Time
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                  Calories
                </label>
                <input
                  type="number"
                  min="200"
                  max="2500"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#190F0E] uppercase tracking-wider">
                  Menu Badges
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. ARTISAN SPECIAL, CHEF PICK"
                  className="w-full px-4 py-3 rounded-2xl border border-[#EBE4D8] focus:border-[#8E1616] focus:outline-hidden text-xs text-[#190F0E] bg-[#FAF7F2]/30"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EBE4D8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/vendor/dashboard"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-[#EBE4D8] hover:border-[#8E1616]/30 text-xs font-bold text-[#6E5F5B] text-center transition"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage || isLimitReached}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#8E1616] hover:bg-[#721111] disabled:opacity-50 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Firing Recipe into Hearth...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Publish Pizza to Hearth Catalog</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
