"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("pizzahub_theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("pizzahub_theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("pizzahub_theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] shrink-0" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#EFE7DE] flex items-center justify-center text-[#190F0E] hover:bg-gray-100 transition cursor-pointer shrink-0"
      title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
      aria-label="Toggle visual theme"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-[#6E5F5B]" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
}
