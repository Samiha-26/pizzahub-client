"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "@/lib/auth-client";

interface Review {
  _id?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

interface ReviewsData {
  pizzaId: string;
  totalReviews: number;
  averageRating: number;
  distribution: Record<string, number>;
  reviews: Review[];
}

export default function PizzaReviews({ pizzaId }: { pizzaId: string }) {
  const { data: session } = useSession();
  const user = session?.user;

  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let isMounted = true;

    async function fetchReviews() {
      try {
        const res = await fetch(`${apiBase}/api/reviews/${pizzaId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setReviewsData(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (pizzaId) {
      fetchReviews();
    }

    return () => {
      isMounted = false;
    };
  }, [pizzaId, apiBase]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to leave a review", { icon: "🔒" });
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a short comment about your pizza experience");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pizzaId,
          customerName: user.name || "Artisan Foodie",
          customerEmail: user.email,
          rating,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to post review");
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
    } catch (err) {
      toast.error("Could not submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-12 p-8 rounded-3xl bg-white border border-[#EBE4D8] animate-pulse">
        <div className="h-6 w-48 bg-stone-200 rounded-md mb-4" />
        <div className="h-4 w-72 bg-stone-100 rounded-md" />
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const average = reviewsData?.averageRating || 5.0;
  const total = reviewsData?.totalReviews || 0;

  return (
    <div className="mt-12 rounded-3xl bg-white border border-[#EBE4D8] p-6 sm:p-10 shadow-xs space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#190F0E]">
              Artisan Crust &amp; Taste Reviews
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EBE4D8] text-[#8E1616]">
              {total} Verified
            </span>
          </div>
          <p className="text-xs text-[#6E5F5B] mt-1">
            Real feedback from verified buyers across our wood-fired delivery hubs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-lg font-black text-[#190F0E]">{average}</span>
              <span className="text-xs text-[#6E5F5B]">/ 5</span>
            </div>
            <div className="text-[10px] text-[#6E5F5B]">Authentic Score</div>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 rounded-xl bg-[#8E1616] hover:bg-[#731212] text-white text-xs font-black transition cursor-pointer"
          >
            {isFormOpen ? "Close Form" : "Write a Review"}
          </button>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#190F0E]">Your Rating</span>
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
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
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
            className="w-full p-3 rounded-xl border border-[#EBE4D8] bg-white text-xs text-[#190F0E] focus:outline-none focus:border-[#8E1616] resize-none"
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
          <div className="text-center py-8 text-xs text-[#6E5F5B]">
            No reviews yet for this pizza. Be the first to share your hearth experience!
          </div>
        ) : (
          reviews.map((rev, idx) => (
            <div key={rev._id || idx} className="p-4 rounded-2xl border border-[#EBE4D8] bg-[#FAF7F2]/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#8E1616]/10 text-[#8E1616] flex items-center justify-center text-xs font-black">
                    {rev.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#190F0E] flex items-center gap-1">
                      <span>{rev.customerName}</span>
                      {rev.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#423735] leading-relaxed pl-9">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
