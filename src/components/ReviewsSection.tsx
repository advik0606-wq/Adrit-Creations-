import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, Sparkles, Plus, Send } from 'lucide-react';
import { CustomerReview, Chocolate } from '../types';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
  chocolates: Chocolate[];
  onAddReview: (review: CustomerReview) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  chocolates,
  onAddReview,
}) => {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterChocolate, setFilterChocolate] = useState<string>('all');
  const [isWritingReview, setIsWritingReview] = useState<boolean>(false);
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  // Review Form State
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formChocolate, setFormChocolate] = useState<string>(chocolates[0]?.name || 'Velvet Belgian Dark Truffles');
  const [formComment, setFormComment] = useState('');
  const [formError, setFormError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (filterChocolate !== 'all' && r.chocolateName !== filterChocolate) return false;
    return true;
  });

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const fiveStarPercentage = reviews.length
    ? Math.round((reviews.filter((r) => r.rating === 5).length / reviews.length) * 100)
    : 100;

  const handleHelpfulClick = (id: string) => {
    setHelpfulLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) {
      setFormError('Please enter your name and your review comment.');
      return;
    }

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      customerName: formName.trim(),
      customerCity: formCity.trim() || 'Verified Food Lover',
      rating: formRating,
      chocolateName: formChocolate,
      date: 'Just now',
      comment: formComment.trim(),
      verifiedPurchase: true,
      helpfulCount: 1,
    };

    onAddReview(newRev);
    setReviewSuccess(true);
    setFormComment('');
    setFormName('');
    setFormCity('');
    setFormError('');

    setTimeout(() => {
      setReviewSuccess(false);
      setIsWritingReview(false);
    }, 2000);
  };

  return (
    <section id="reviews" className="py-16 md:py-24 bg-gradient-to-b from-white via-rose-50/40 to-[#fffbf5] relative border-t border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 text-rose-900 text-xs font-bold uppercase tracking-wider mb-3 border border-rose-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Real Customer Love</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2a160d]">
            Customer Reviews & Stories
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5a3825] leading-relaxed">
            Nothing brings greater joy to Sunita than hearing how our chocolates made someone’s celebration sweeter.
          </p>
        </div>

        {/* Reviews Overview Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border-2 border-rose-100 rounded-3xl p-6 sm:p-8 mb-12 shadow-lg">
          
          {/* Big Score */}
          <div className="lg:col-span-4 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-rose-100 pb-6 lg:pb-0 lg:pr-8">
            <div className="text-5xl sm:text-6xl font-serif font-bold bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 bg-clip-text text-transparent">
              {averageRating}
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-500 my-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[#7c5c47] font-medium">
              Based on {reviews.length} authentic customer ratings
            </p>
            <p className="text-xs text-emerald-700 font-bold mt-1 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-200">
              {fiveStarPercentage}% of customers gave 5 stars!
            </p>
          </div>

          {/* Rating Bars & Breakdown */}
          <div className="lg:col-span-5 space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-12 text-[#5c3722] flex items-center gap-1 font-bold">
                    {stars} <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-rose-50 overflow-hidden border border-rose-100">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[#8c6550] font-bold">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Write a Review Button */}
          <div className="lg:col-span-3 text-center lg:text-right">
            <button
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="w-full lg:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto lg:ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isWritingReview ? 'Close Form' : 'Write a Review'}</span>
            </button>
            <p className="text-[11px] text-rose-800 mt-2 font-medium">
              Share your taste experience with Sunita
            </p>
          </div>

        </div>

        {/* Write Review Form Collapsible */}
        {isWritingReview && (
          <div className="mb-12 bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 shadow-xl animate-fadeIn">
            <h3 className="font-serif text-xl font-bold text-[#2a160d] mb-1">
              Leave a Customer Review
            </h3>
            <p className="text-xs text-[#7c5c47] mb-6 font-medium">
              Your feedback inspires Mom to craft new batches and recipes.
            </p>

            {reviewSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center text-emerald-800 space-y-2">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-600" />
                <h4 className="font-bold text-base">Thank you for your warm review!</h4>
                <p className="text-xs text-emerald-700">
                  Your review has been published to Adrit Creations.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {formError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl font-semibold">
                    {formError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#7c5c47] mb-1.5 font-bold">
                      Your Rating:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFormRating(star)}
                          className="p-1 text-amber-500 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formRating ? 'fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#7c5c47] mb-1 font-bold">
                      Your Full Name:
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Shalini Roy"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:border-rose-500 focus:outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#7c5c47] mb-1 font-bold">
                      City / Location:
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="e.g. Gurugram"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:border-rose-500 focus:outline-none shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#7c5c47] mb-1 font-bold">
                    Chocolate Ordered:
                  </label>
                  <select
                    value={formChocolate}
                    onChange={(e) => setFormChocolate(e.target.value)}
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:border-rose-500 focus:outline-none shadow-xs"
                  >
                    {chocolates.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Custom Gift Hamper">Custom Gift Hamper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#7c5c47] mb-1 font-bold">
                    Your Review & Experience:
                  </label>
                  <textarea
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Tell us what you loved about the taste, texture, packaging, or freshness..."
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2.5 text-xs text-[#2a160d] focus:border-rose-500 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(false)}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-xs text-[#7c5c47] hover:text-[#2a160d] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white text-xs font-bold hover:opacity-95 flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-[#8c6550] mr-2 font-bold">Filter by stars:</span>
          {['all', 5, 4].map((star) => (
            <button
              key={star.toString()}
              onClick={() => setFilterRating(star as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                filterRating === star
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-[#5c3722] hover:bg-rose-50 border border-rose-200'
              }`}
            >
              {star === 'all' ? 'All Ratings' : `${star} Stars ★`}
            </button>
          ))}
        </div>

        {/* Reviews Cards Grid with Colorful Accents */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-rose-200 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-100 to-amber-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg sm:text-xl text-[#2a160d]">
                Be The First To Leave A Review!
              </h4>
              <p className="text-xs sm:text-sm text-[#7c5c47] mt-1 max-w-sm mx-auto leading-relaxed">
                Reviews have been freshly reset. Sunita loves hearing how our handcrafted chocolates made your day special!
              </p>
            </div>
            <button
              onClick={() => setIsWritingReview(true)}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:opacity-95 cursor-pointer transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Write the First Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => {
              const isHelpful = helpfulLiked[rev.id];
              const currentCount = rev.helpfulCount + (isHelpful ? 1 : 0);

              return (
                <div
                  key={rev.id}
                  className="bg-white border-2 border-rose-100 hover:border-rose-300 rounded-3xl p-6 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between space-y-4 bg-colorful-card-hover"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-current' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-[#8c6550] font-medium">{rev.date}</span>
                    </div>

                    <div className="inline-block bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 px-3 py-1 rounded-xl text-[11px] text-rose-900 font-bold mb-3">
                      🍫 {rev.chocolateName}
                    </div>

                    <p className="text-xs sm:text-sm text-[#3b2012] italic font-serif leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-rose-100 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-[#2a160d]">
                        {rev.customerName}
                      </h5>
                      <p className="text-[11px] text-[#7c5c47] flex items-center gap-1">
                        <span>{rev.customerCity}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-emerald-700 font-bold">&bull; Verified Order</span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => handleHelpfulClick(rev.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] border transition-colors cursor-pointer ${
                        isHelpful
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                          : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3 text-amber-600" />
                      <span>Helpful ({currentCount})</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
