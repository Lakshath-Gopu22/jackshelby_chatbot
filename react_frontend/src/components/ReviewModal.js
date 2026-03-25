import { useState } from "react";
import { createReview } from "../services/api";

export default function ReviewModal({ orderId, productName, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (rating === 0) return;
    setLoading(true);
    const res = await createReview(orderId, rating, review);
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
      setTimeout(() => {
        onSubmitted && onSubmitted();
        onClose();
      }, 1500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div
        className="relative glass-panel rounded-3xl w-full max-w-md modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Rate Your Order</h2>
            <p className="text-gray-400 text-sm mt-1">{orderId} • {productName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-danger/20 transition-all text-gray-400 hover:text-danger text-sm"
          >✕</button>
        </div>

        <div className="p-6 space-y-6">
          {submitted ? (
            <div className="text-center py-10 animate-scale-in">
              <span className="text-5xl block mb-4">🎉</span>
              <h3 className="text-xl font-bold text-success">Thank You!</h3>
              <p className="text-gray-400 mt-2">Your review has been submitted</p>
            </div>
          ) : (
            <>
              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3">How would you rate this delivery?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      className="star-btn"
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(s)}
                    >
                      <span className={`text-3xl ${
                        s <= (hover || rating) ? "text-warning drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-gray-600"
                      }`}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-gray-400 mt-2 animate-fade-in">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                  </p>
                )}
              </div>

              {/* Feedback */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Feedback (optional)</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                  rows={3}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || loading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  rating === 0
                    ? "bg-white/5 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-warning to-warning/70 text-black hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                }`}
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
