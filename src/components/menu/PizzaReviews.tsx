"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquare, Send, ChefHat, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";
import { resolveApiBaseUrl } from "@/lib/api";

interface ReviewReply {
  vendorName: string;
  vendorEmail?: string;
  message: string;
  createdAt: string;
}

interface Review {
  _id?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
  reply?: ReviewReply;
}

interface ReviewsData {
  pizzaId: string;
  totalReviews: number;
  averageRating: number;
  distribution: Record<string, number>;
  reviews: Review[];
}

interface PizzaReviewsProps {
  pizzaId: string;
  vendorName?: string;
  vendorEmail?: string;
}

export default function PizzaReviews({ pizzaId, vendorName, vendorEmail }: PizzaReviewsProps) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || "customer";
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";
  const isCustomer = !isVendor && !isAdmin;
  const canReply = isAdmin || (isVendor && (!vendorEmail || user?.email?.toLowerCase() === vendorEmail?.toLowerCase()));

  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchReviews() {
      try {
        const localRes = await fetch(`/api/reviews/${pizzaId}`);
        if (localRes.ok) {
          const data = await localRes.json();
          if (isMounted) {
            setReviewsData(data);
            setLoading(false);
            return;
          }
        }

        const baseUrl = resolveApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/reviews/${pizzaId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setReviewsData(data);
          }
        }
      } catch {
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (pizzaId) {
      fetchReviews();
    }

    return () => {
      isMounted = false;
    };
  }, [pizzaId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to leave a review", { icon: "🔒" });
      return;
    }

    if (!isCustomer) {
      toast.error("Reviews can only be submitted by verified customer accounts.", { icon: "🛡️" });
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a short comment about your pizza experience");
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewPayload = {
        pizzaId,
        customerName: user.name || "Artisan Foodie",
        customerEmail: user.email,
        rating,
        comment: comment.trim(),
      };

      let posted = false;
      try {
        const localRes = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewPayload),
        });
        if (localRes.ok) {
          posted = true;
        }
      } catch {}

      if (!posted) {
        const baseUrl = resolveApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewPayload),
        });
        if (!res.ok) {
          throw new Error("Failed to post review");
        }
      }

      const newReview: Review = {
        customerName: user.name || "Artisan Foodie",
        customerEmail: user.email || "",
        rating,
        comment: comment.trim(),
        isVerifiedBuyer: true,
        createdAt: new Date().toISOString(),
      };

      setReviewsData((prev) => {
        if (!prev) return null;
        const updatedReviews = [newReview, ...prev.reviews];
        const newTotal = updatedReviews.length;
        const newSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        return {
          ...prev,
          totalReviews: newTotal,
          averageRating: Number((newSum / newTotal).toFixed(1)),
          reviews: updatedReviews,
        };
      });

      setComment("");
      setIsFormOpen(false);
      toast.success("Review posted successfully! Thank you for supporting artisan bakers.", {
        icon: "🍕",
      });
    } catch {
      toast.error("Could not submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Please enter your kitchen response before submitting");
      return;
    }

    setIsSubmittingReply(true);
    const replyPayload = {
      vendorName: user?.name || vendorName || "Kitchen Team",
      vendorEmail: user?.email || "",
      message: replyText.trim(),
    };

    try {
      await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replyPayload),
      });
    } catch {}

    try {
      const baseUrl = resolveApiBaseUrl();
      await fetch(`${baseUrl}/api/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replyPayload),
      });
    } catch {}

    setReviewsData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        reviews: prev.reviews.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                reply: {
                  ...replyPayload,
                  createdAt: new Date().toISOString(),
                },
              }
            : r
        ),
      };
    });

    setReplyText("");
    setReplyingToId(null);
    setIsSubmittingReply(false);
    toast.success("Kitchen response posted successfully!", { icon: "👨‍🍳" });
  };

  if (loading) {
    return (
      <div className="mt-12 p-8 rounded-3xl bg-white dark:bg-[#1A1110] border border-[#EBE4D8] dark:border-[#2D1E1B] animate-pulse">
        <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded-md mb-4" />
        <div className="h-4 w-72 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const average = reviewsData?.averageRating || 5.0;
  const total = reviewsData?.totalReviews || 0;

  return (
    <div className="mt-12 rounded-3xl bg-white dark:bg-[#1A1110] border border-[#EBE4D8] dark:border-[#2D1E1B] p-6 sm:p-10 shadow-xs space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] dark:border-[#2D1E1B] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#190F0E] dark:text-white">
              Artisan Crust &amp; Taste Reviews
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] dark:bg-[#251715] border border-[#EBE4D8] dark:border-[#382320] text-[#8E1616] dark:text-[#E25C5C]">
              {total} Verified
            </span>
          </div>
          <p className="text-xs text-[#6E5F5B] dark:text-zinc-400 mt-1">
            Real feedback from verified buyers across our wood-fired delivery hubs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-lg font-black text-[#190F0E] dark:text-white">{average}</span>
              <span className="text-xs text-[#6E5F5B] dark:text-zinc-400">/ 5</span>
            </div>
            <div className="text-[10px] text-[#6E5F5B] dark:text-zinc-400">Authentic Score</div>
          </div>

          {isCustomer && (
            <button
              type="button"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-4 py-2 rounded-xl bg-[#8E1616] hover:bg-[#731212] text-white text-xs font-black transition cursor-pointer"
            >
              {isFormOpen ? "Close Form" : "Write a Review"}
            </button>
          )}

          {isVendor && (
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Kitchen Team View</span>
            </span>
          )}

          {isAdmin && (
            <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
              <span>Admin Moderation View</span>
            </span>
          )}
        </div>
      </div>

      {isFormOpen && isCustomer && (
        <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#190F0E] dark:text-white">Your Rating</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts on the fermentation, leopard spotting, crust crumb, or toppings..."
            className="w-full p-3 rounded-xl border border-[#EBE4D8] dark:border-[#2D1E1B] bg-white dark:bg-[#160D0C] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] resize-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8E1616] hover:bg-[#731212] disabled:opacity-50 text-white text-xs font-black transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Submitting..." : "Post Review"}</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#6E5F5B] dark:text-zinc-400">
            No reviews yet for this pizza. Be the first to share your hearth experience!
          </div>
        ) : (
          reviews.map((rev, idx) => (
            <div key={rev._id || idx} className="p-4 sm:p-5 rounded-2xl border border-[#EBE4D8] dark:border-[#2D1E1B] bg-[#FAF7F2]/50 dark:bg-[#1E1413]/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center text-xs font-black">
                    {rev.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#190F0E] dark:text-white flex items-center gap-1">
                      <span>{rev.customerName}</span>
                      {rev.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#6E5F5B] dark:text-zinc-400">
                      {new Date(rev.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#423735] dark:text-zinc-200 leading-relaxed pl-1 sm:pl-10">
                {rev.comment}
              </p>

              {rev.reply && (
                <div className="ml-2 sm:ml-10 p-3.5 rounded-2xl bg-white dark:bg-[#1E1413] border border-amber-200 dark:border-amber-800/40 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-300">
                      <ChefHat className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Response from {rev.reply.vendorName || vendorName || "Kitchen Team"}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 uppercase font-black">
                        Kitchen Reply
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6E5F5B] dark:text-zinc-400">
                      {new Date(rev.reply.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs text-[#2A1E1C] dark:text-amber-100 leading-relaxed pl-5">
                    {rev.reply.message}
                  </p>
                </div>
              )}

              {canReply && !rev.reply && rev._id && (
                <div className="pl-1 sm:pl-10 pt-1">
                  {replyingToId === rev._id ? (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1413] border border-[#EBE4D8] dark:border-[#2D1E1B] space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#190F0E] dark:text-white">
                        <ChefHat className="w-3.5 h-3.5 text-[#8E1616]" />
                        <span>Reply as {user?.name || vendorName || "Kitchen Team"}</span>
                      </div>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Thank the customer or share details about your crust and baking method..."
                        className="w-full p-2.5 rounded-xl border border-[#EBE4D8] dark:border-[#2D1E1B] bg-[#FAF7F2] dark:bg-[#160D0C] text-xs text-[#190F0E] dark:text-white focus:outline-none focus:border-[#8E1616] resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToId(null);
                            setReplyText("");
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-[#6E5F5B] dark:text-zinc-400 hover:text-[#190F0E] dark:hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSubmittingReply}
                          onClick={() => handleSendReply(rev._id!)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#8E1616] text-white text-xs font-bold hover:bg-[#731212] transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{isSubmittingReply ? "Sending..." : "Post Kitchen Reply"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToId(rev._id || null);
                        setReplyText("");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8E1616] hover:text-[#731212] transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply to this review</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
