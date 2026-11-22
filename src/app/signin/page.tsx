"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid credentials. Please verify your email and password.");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back! Signed in successfully.", {
        icon: "🍕",
      });

      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get("redirect");

      const destination = redirectParam || "/";
      window.location.href = destination;
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during sign-in.");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Google authentication.");
      setIsGoogleLoading(false);
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
            Welcome Back
          </h1>
          <p className="text-xs text-[#6E5F5B]">
            Sign in to track orders, manage kitchen menus, or moderate the platform
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#8E1616] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#8E1616]" />
            <span className="leading-snug font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            disabled={isGoogleLoading || isLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-[#EFE7DE] hover:bg-[#FAF7F2] text-[#190F0E] font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-2xs hover:border-gray-300 disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#8E1616]" />
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
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#EFE7DE] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-[#6E5F5B] uppercase tracking-wider absolute">
              or with email
            </span>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4 pt-1">
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#190F0E] block">
                  Password
                </label>
              </div>
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
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 rounded-2xl bg-[#8E1616] hover:bg-[#731212] text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-[#8E1616]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center pt-2 border-t border-[#EFE7DE]">
          <p className="text-xs text-[#6E5F5B]">
            Don't have an account yet?{" "}
            <Link href="/signup" className="font-bold text-[#8E1616] hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
