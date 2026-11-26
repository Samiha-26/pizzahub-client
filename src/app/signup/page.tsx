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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase;

  const handleGoogleSignUp = async () => {
    setErrorMessage("");
    setIsGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Google registration.");
      setIsGoogleLoading(false);
    }
  };

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
      const errorMsg = "Password must satisfy all security requirements below.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
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
      });

      if (res.error) {
        const errorMsg = res.error.message || "Failed to create account. Please try again.";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      toast.success("Welcome to PizzaHub! Account created successfully.", {
        icon: "🍕",
      });

      window.location.href = "/";
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred during registration.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white dark:bg-[#1A1110] rounded-3xl border border-[#EFE7DE] dark:border-[#2D1E1B] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-10 h-10 rounded-2xl bg-[#8E1616] flex items-center justify-center text-white shadow-md shadow-[#8E1616]/20">
              <span className="text-xl leading-none">🍕</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-[#190F0E] dark:text-white">
              Pizza<span className="text-[#8E1616] dark:text-[#FF8080]">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-[#190F0E] dark:text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-[#6E5F5B] dark:text-zinc-400">
            Join our community of wood-fired connoisseurs &amp; master pizzaiolos
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-[#8E1616] dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#8E1616] dark:text-red-300" />
            <span className="leading-snug font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            disabled={isGoogleLoading || isLoading}
            onClick={handleGoogleSignUp}
            className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#251715] border border-[#EFE7DE] dark:border-[#3D2825] hover:bg-[#FAF7F2] dark:hover:bg-[#32201D] text-[#190F0E] dark:text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-2xs hover:border-gray-300 dark:hover:border-zinc-700 disabled:opacity-50 cursor-pointer"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#8E1616] dark:text-[#FF8080]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign Up with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#EFE7DE] dark:border-[#2D1E1B] w-full" />
            <span className="bg-white dark:bg-[#1A1110] px-3 text-[11px] font-semibold text-[#6E5F5B] dark:text-zinc-400 uppercase tracking-wider absolute">
              or with email &amp; role
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200 block">
              I want to join as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  role === "customer"
                    ? "border-[#8E1616] dark:border-[#FF8080] bg-[#8E1616]/5 dark:bg-[#8E1616]/20 ring-1 ring-[#8E1616] dark:ring-[#FF8080]"
                    : "border-[#EFE7DE] dark:border-[#2D1E1B] bg-white dark:bg-[#251715] hover:border-gray-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ShoppingBag
                    className={`w-4 h-4 ${
                      role === "customer" ? "text-[#8E1616] dark:text-[#FF8080]" : "text-gray-400 dark:text-zinc-500"
                    }`}
                  />
                  {role === "customer" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8E1616] dark:text-[#FF8080]" />
                  )}
                </div>
                <div className="pt-2">
                  <div className="text-xs font-black text-[#190F0E] dark:text-white">Customer</div>
                  <div className="text-[10px] text-[#6E5F5B] dark:text-zinc-400 leading-tight mt-0.5">
                    Order artisan pizzas
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  role === "vendor"
                    ? "border-[#8E1616] dark:border-[#FF8080] bg-[#8E1616]/5 dark:bg-[#8E1616]/20 ring-1 ring-[#8E1616] dark:ring-[#FF8080]"
                    : "border-[#EFE7DE] dark:border-[#2D1E1B] bg-white dark:bg-[#251715] hover:border-gray-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ChefHat
                    className={`w-4 h-4 ${
                      role === "vendor" ? "text-[#8E1616] dark:text-[#FF8080]" : "text-gray-400 dark:text-zinc-500"
                    }`}
                  />
                  {role === "vendor" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8E1616] dark:text-[#FF8080]" />
                  )}
                </div>
                <div className="pt-2">
                  <div className="text-xs font-black text-[#190F0E] dark:text-white">Vendor</div>
                  <div className="text-[10px] text-[#6E5F5B] dark:text-zinc-400 leading-tight mt-0.5">
                    Manage kitchen catalog
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200 block">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marco Rossi"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DE] dark:border-[#3D2825] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] dark:focus:border-amber-500 transition bg-white dark:bg-[#251715]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DE] dark:border-[#3D2825] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] dark:focus:border-amber-500 transition bg-white dark:bg-[#251715]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200 block">
              Profile Photo URL <span className="text-[10px] text-[#6E5F5B] dark:text-zinc-400 font-normal">• Optional</span>
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EFE7DE] dark:border-[#3D2825] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] dark:focus:border-amber-500 transition bg-white dark:bg-[#251715]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#190F0E] dark:text-zinc-200 block">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EFE7DE] dark:border-[#3D2825] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] dark:focus:border-amber-500 transition bg-white dark:bg-[#251715]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2 space-y-1 bg-[#FAF7F2] dark:bg-[#251715] p-2.5 rounded-xl border border-[#EFE7DE]/70 dark:border-[#3D2825]">
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-gray-300 dark:text-zinc-600"
                  }`}
                />
                <span className={hasMinLength ? "text-[#190F0E] dark:text-white font-medium" : "text-[#6E5F5B] dark:text-zinc-400"}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    hasUpperCase ? "text-emerald-600 dark:text-emerald-400" : "text-gray-300 dark:text-zinc-600"
                  }`}
                />
                <span className={hasUpperCase ? "text-[#190F0E] dark:text-white font-medium" : "text-[#6E5F5B] dark:text-zinc-400"}>
                  At least one uppercase letter A-Z
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    hasLowerCase ? "text-emerald-600 dark:text-emerald-400" : "text-gray-300 dark:text-zinc-600"
                  }`}
                />
                <span className={hasLowerCase ? "text-[#190F0E] dark:text-white font-medium" : "text-[#6E5F5B] dark:text-zinc-400"}>
                  At least one lowercase letter a-z
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#731212] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-[#8E1616]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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

        <div className="text-center pt-2 border-t border-[#EFE7DE] dark:border-[#2D1E1B]">
          <p className="text-xs text-[#6E5F5B] dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/signin" className="font-bold text-[#8E1616] dark:text-[#FF8080] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
