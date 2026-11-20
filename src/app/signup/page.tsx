"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  ChefHat,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Password must satisfy all security requirements below.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: imageUrl.trim() || undefined,
        role,
        callbackURL: "/signin",
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome to PizzaHub! Account created successfully.", {
        icon: "🍕",
      });

      router.push("/signin");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during registration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EFE7DE] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-2xl bg-[#8E1616] flex items-center justify-center text-white shadow-md shadow-[#8E1616]/20">
              <span className="text-xl leading-none">🍕</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-[#190F0E]">
              Pizza<span className="text-[#8E1616]">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#190F0E] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-[#6E5F5B]">
            Join our community of wood-fired connoisseurs &amp; master pizzaiolos
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#8E1616] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#8E1616]" />
            <span className="leading-snug font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#190F0E] block">
              I want to join as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  role === "customer"
                    ? "border-[#8E1616] bg-[#8E1616]/5 ring-1 ring-[#8E1616]"
                    : "border-[#EFE7DE] bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ShoppingBag
                    className={`w-4 h-4 ${
                      role === "customer" ? "text-[#8E1616]" : "text-gray-400"
                    }`}
                  />
                  {role === "customer" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8E1616]" />
                  )}
                </div>
                <div className="pt-2">
                  <div className="text-xs font-black text-[#190F0E]">Customer</div>
                  <div className="text-[10px] text-[#6E5F5B] leading-tight mt-0.5">
                    Order artisan pizzas
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  role === "vendor"
                    ? "border-[#8E1616] bg-[#8E1616]/5 ring-1 ring-[#8E1616]"
                    : "border-[#EFE7DE] bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ChefHat
                    className={`w-4 h-4 ${
                      role === "vendor" ? "text-[#8E1616]" : "text-gray-400"
                    }`}
                  />
                  {role === "vendor" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8E1616]" />
                  )}
                </div>
                <div className="pt-2">
                  <div className="text-xs font-black text-[#190F0E]">Vendor</div>
                  <div className="text-[10px] text-[#6E5F5B] leading-tight mt-0.5">
                    Manage kitchen catalog
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#190F0E] block">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marco Rossi"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DE] text-xs text-[#190F0E] focus:outline-none focus:border-[#8E1616] transition bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#190F0E] block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DE] text-xs text-[#190F0E] focus:outline-none focus:border-[#8E1616] transition bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#190F0E] block">
              Profile Photo URL <span className="text-[10px] text-[#6E5F5B] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DE] text-xs text-[#190F0E] focus:outline-none focus:border-[#8E1616] transition bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#190F0E] block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EFE7DE] text-xs text-[#190F0E] focus:outline-none focus:border-[#8E1616] transition bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2 space-y-1 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EFE7DE]/70">
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    hasMinLength ? "text-emerald-600" : "text-gray-300"
                  }`}
                />
                <span className={hasMinLength ? "text-[#190F0E] font-medium" : "text-[#6E5F5B]"}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    hasUpperCase ? "text-emerald-600" : "text-gray-300"
                  }`}
                />
                <span className={hasUpperCase ? "text-[#190F0E] font-medium" : "text-[#6E5F5B]"}>
                  At least one uppercase letter (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    hasLowerCase ? "text-emerald-600" : "text-gray-300"
                  }`}
                />
                <span className={hasLowerCase ? "text-[#190F0E] font-medium" : "text-[#6E5F5B]"}>
                  At least one lowercase letter (a-z)
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#731212] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-[#8E1616]/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Artisan Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EFE7DE]">
          <p className="text-xs text-[#6E5F5B]">
            Already have an account?{" "}
            <Link href="/signin" className="font-bold text-[#8E1616] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
