"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  FileText,
  Save,
  Crown,
  ShieldAlert,
  ShoppingBag,
  Store,
  ChefHat,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSession, authClient } from "@/lib/auth-client";
import { resolveApiBaseUrl } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as any;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [street, setStreet] = useState("");
  const [cityArea, setCityArea] = useState("Little Italy, Manhattan, NY");
  const [postalCode, setPostalCode] = useState("10013");
  const [instructions, setInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      if (user.name) setName(user.name);
      if (user.image) setAvatarUrl(user.image);

      const savedData = localStorage.getItem(`pizzahub_profile_${user.email}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.name && !user.name) setName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.street) setStreet(parsed.street);
          if (parsed.cityArea) setCityArea(parsed.cityArea);
          if (parsed.postalCode) setPostalCode(parsed.postalCode);
          if (parsed.instructions) setInstructions(parsed.instructions);
        } catch {}
      } else {
        const savedArea = localStorage.getItem("pizzahub_delivery_area");
        if (savedArea) {
          setCityArea(savedArea);
        }
      }

      fetch("/api/profile")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted || !data) return;
          if (data.name) setName(data.name);
          if (data.image) setAvatarUrl(data.image);
          if (data.phone) setPhone(data.phone);
          if (data.street) setStreet(data.street);
          if (data.cityArea) setCityArea(data.cityArea);
          if (data.postalCode) setPostalCode(data.postalCode);
          if (data.instructions) setInstructions(data.instructions);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    const trimmedName = name.trim();
    const profilePayload = {
      name: trimmedName,
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim(),
      street: street.trim(),
      cityArea: cityArea.trim(),
      postalCode: postalCode.trim(),
      instructions: instructions.trim(),
      email: user.email,
    };

    localStorage.setItem(`pizzahub_profile_${user.email}`, JSON.stringify(profilePayload));

    const fullAddress = street.trim()
      ? `${street.trim()}, ${cityArea.trim()} ${postalCode.trim()}`
      : cityArea.trim();
    localStorage.setItem("pizzahub_delivery_area", fullAddress);

    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });
    } catch {}

    try {
      await authClient.updateUser({
        name: trimmedName,
        image: avatarUrl.trim() || undefined,
      });
    } catch {}

    try {
      const baseUrl = resolveApiBaseUrl();
      await fetch(`${baseUrl}/api/users/profile/${encodeURIComponent(user.email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          phone: phone.trim(),
          image: avatarUrl.trim(),
          street: street.trim(),
          cityArea: cityArea.trim(),
          postalCode: postalCode.trim(),
          instructions: instructions.trim(),
        }),
      });
    } catch {}

    setIsSaving(false);
    toast.success("Profile preferences and name saved successfully", {
      icon: "🍕",
    });
    router.refresh();
  };

  if (isPending) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-3 py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#8E1616] dark:border-[#E25C5C] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-[#6E5F5B] dark:text-zinc-400">Loading your profile details...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-24 px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-white dark:bg-[#1A1110] rounded-3xl p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8E1616]/10 dark:bg-[#8E1616]/25 text-[#8E1616] dark:text-[#FF8080] flex items-center justify-center mx-auto text-2xl font-black">
            PH
          </div>
          <h2 className="text-2xl font-black text-[#190F0E] dark:text-white">Sign In Required</h2>
          <p className="text-sm text-[#6E5F5B] dark:text-zinc-400">
            Please sign in to view your profile settings, saved addresses, and active orders.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-[#8E1616] text-white font-bold text-sm hover:bg-[#721212] transition-colors"
          >
            Sign In to PizzaHub
          </Link>
        </div>
      </main>
    );
  }

  const role = user.role || "customer";
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";
  const isPremium = user.subscriptionTier === "premium";

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#120B0A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-[#1A1110] rounded-3xl p-6 sm:p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#8E1616] dark:border-[#E25C5C]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#8E1616] text-white flex items-center justify-center text-3xl font-black shadow-sm">
                {(name || user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase shadow-sm">
                Admin
              </div>
            )}
            {isVendor && (
              <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase shadow-sm flex items-center gap-1">
                {isPremium && <Crown className="w-2.5 h-2.5 fill-current" />}
                Vendor
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#190F0E] dark:text-white">
                {name || user.name || "Artisan Connoisseur"}
              </h1>
              {isAdmin && (
                <span className="w-fit mx-auto sm:mx-0 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
                  Platform Admin
                </span>
              )}
              {isVendor && (
                <span className="w-fit mx-auto sm:mx-0 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  {isPremium && <Crown className="w-3 h-3 fill-amber-500 text-amber-600 dark:text-amber-400" />}
                  <span>{isPremium ? "Premium Master Baker" : "Pizzeria Partner"}</span>
                </span>
              )}
              {!isAdmin && !isVendor && (
                <span className="w-fit mx-auto sm:mx-0 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-stone-100 dark:bg-zinc-800 text-[#6E5F5B] dark:text-zinc-300">
                  Verified Customer
                </span>
              )}
            </div>

            <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#6E5F5B] dark:text-zinc-400" />
              <span>{user.email}</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/50 inline-flex items-center gap-1.5 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {isVendor && (
                <>
                  <Link
                    href="/vendor/dashboard"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/50 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Kitchen Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/vendor/upgrade"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    <span>{isPremium ? "Plan Details" : "Upgrade to Premium"}</span>
                  </Link>
                </>
              )}
              {!isAdmin && !isVendor && (
                <Link
                  href="/orders"
                  className="px-3.5 py-1.5 rounded-xl bg-[#8E1616]/10 dark:bg-[#8E1616]/25 hover:bg-[#8E1616]/15 dark:hover:bg-[#8E1616]/35 text-[#8E1616] dark:text-[#FF8080] font-bold border border-[#8E1616]/20 dark:border-[#8E1616]/40 inline-flex items-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>View Order Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1110] rounded-3xl p-6 sm:p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-6">
            <div className="border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-4">
              <h2 className="text-lg font-black text-[#190F0E] dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#8E1616] dark:text-[#FF8080]" />
                Personal Details
              </h2>
              <p className="text-xs text-[#6E5F5B] dark:text-zinc-400">
                Your account credentials and preferred display name on PizzaHub.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6E5F5B] dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#190F0E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6E5F5B] dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-zinc-900 border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#6E5F5B] dark:text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6E5F5B] dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#190F0E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">Avatar Image Link</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#190F0E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1110] rounded-3xl p-6 sm:p-8 border border-[#EBE4D8] dark:border-[#2D1E1B] shadow-2xs space-y-6">
            <div className="border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-4">
              <h2 className="text-lg font-black text-[#190F0E] dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8E1616] dark:text-[#FF8080]" />
                Default Delivery Address &amp; Courier Notes
              </h2>
              <p className="text-xs text-[#6E5F5B] dark:text-zinc-400">
                This address will automatically pre-fill your order checkout modal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">Street Address</label>
                <div className="relative">
                  <Home className="w-4 h-4 text-[#6E5F5B] dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 142 Mulberry Street, Apt 4B"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#190F0E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 10013"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#190F0E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">
                  Neighborhood / US Pizza Hub
                </label>
                <select
                  value={cityArea}
                  onChange={(e) => setCityArea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#190F0E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
                >
                  <option value="Little Italy, Manhattan, NY">Little Italy, Manhattan, NY</option>
                  <option value="Williamsburg, Brooklyn, NY">Williamsburg, Brooklyn, NY</option>
                  <option value="North Beach, San Francisco, CA">North Beach, San Francisco, CA</option>
                  <option value="West Loop, Chicago, IL">West Loop, Chicago, IL</option>
                  <option value="Federal Hill, Providence, RI">Federal Hill, Providence, RI</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200">
                  Delivery Instructions for Courier
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-[#6E5F5B] dark:text-zinc-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Leave in entry foyer. Dial code #401 to ring buzzer."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#3D2825] text-xs font-bold text-[#190F0E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8E1616] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#8E1616] hover:bg-[#721212] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Preferences..." : "Save Profile & Address"}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
