"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Flame, Sparkles, Star, Award, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/menu");
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative overflow-hidden py-6 sm:py-10 lg:py-14">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#8E1616]/5 via-[#D97706]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <motion.div
          className="lg:col-span-7 space-y-6 text-center lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEE2E2] text-[#8E1616] text-[11px] font-black uppercase tracking-wider border border-[#FECACA] shadow-xs">
            <Flame className="w-3.5 h-3.5 text-[#8E1616] animate-pulse" />
            <span>A Fire-Infused Taste Sensation</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl xl:text-6xl font-black text-[#190F0E] leading-[1.1] tracking-tight"
          >
            Hot &amp; Fresh Pizza <br />
            <span className="text-[#8E1616] relative inline-block">
              Delivered to Your Door
              <motion.span
                className="absolute -bottom-1 left-0 w-full h-1 bg-[#8E1616]/20 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm text-[#6E5F5B] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
          >
            Incredible blistered crusts, cold-fermented doughs, and organic farm-fresh produce from authenticated local wood-fired pizzerias across America.
          </motion.p>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSearch}
            className="max-w-lg mx-auto lg:mx-0 p-1.5 bg-white rounded-2xl border border-[#EFE7DE] shadow-md flex items-center gap-2 transition focus-within:border-[#8E1616] focus-within:ring-2 focus-within:ring-[#8E1616]/10"
          >
            <span className="pl-3.5 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for neapolitan, hot honey burrata, vegan..."
              className="w-full text-xs sm:text-sm bg-transparent outline-none py-2 text-[#190F0E] placeholder:text-gray-400"
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                variant="crimson"
                size="default"
                className="shrink-0 flex items-center gap-1.5 px-4 sm:px-5 cursor-pointer shadow-xs"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          </motion.form>

          <motion.div
            variants={itemVariants}
            className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs text-[#6E5F5B]"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center font-black">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-black text-[#190F0E] block text-sm">150+</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">Stone Ovens</span>
              </div>
            </div>

            <div className="h-6 w-px bg-[#EFE7DE] hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-black">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-black text-[#190F0E] block text-sm">28 min</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">Avg. Dispatch</span>
              </div>
            </div>

            <div className="h-6 w-px bg-[#EFE7DE] hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black">
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              </div>
              <div>
                <span className="font-black text-[#190F0E] block text-sm">4.9 / 5.0</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">Tasting Score</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="lg:col-span-5 relative flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <div className="relative w-72 sm:w-88 md:w-96 aspect-square">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8E1616]/15 via-amber-500/10 to-transparent blur-2xl animate-pulse" />

            <motion.div
              className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-stone-100"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            >
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
                alt="Wood-Fired Margherita Pizza"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs font-black">Margherita D.O.P.</div>
                  <div className="text-[10px] text-amber-300 font-medium">San Marzano &bull; Campanian Bufala</div>
                </div>
                <div className="text-sm font-black text-white">$16.00</div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -top-3 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#EBE4D8] p-3 rounded-2xl shadow-lg flex items-center gap-2.5 z-10"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 0.3 }}
            >
              <div className="w-8 h-8 rounded-xl bg-[#8E1616] text-white flex items-center justify-center font-black shadow-xs">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-black text-[#190F0E]">900°F Stone Baked</div>
                <div className="text-[9px] text-[#6E5F5B] font-semibold">Fast 90s Flash Bake</div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-3 -right-3 sm:-right-6 bg-white/95 backdrop-blur-md border border-[#EBE4D8] p-3 rounded-2xl shadow-lg flex items-center gap-2.5 z-10"
              animate={{ y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 0.6 }}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-black text-[#190F0E]">48h Sourdough</div>
                <div className="text-[9px] text-[#6E5F5B] font-semibold">Cold Fermentation</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
