import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Star, ChevronLeft, ChevronRight, ShoppingBag, 
  CheckCircle2, Play, Pause 
} from 'lucide-react';
import { Chocolate, BoxOption } from '../types';

interface FeaturedChocolatesProps {
  chocolates: Chocolate[];
  onSelectChocolate: (chocolate: Chocolate) => void;
  onQuickOrder: (chocolate: Chocolate, selectedBox: BoxOption) => void;
  onAddToCart: (chocolate: Chocolate, selectedBox: BoxOption) => void;
}

export const FeaturedChocolates: React.FC<FeaturedChocolatesProps> = ({
  chocolates,
  onSelectChocolate,
  onQuickOrder,
  onAddToCart,
}) => {
  const featuredList = chocolates.filter((c) => c.isFeatured || c.rating >= 4.9);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoPlaying || featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredList.length]);

  if (featuredList.length === 0) return null;

  const current = featuredList[currentIndex];
  const popularBox = current.boxOptions.find((b) => b.popular) || current.boxOptions[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  return (
    <section id="featured" className="py-16 bg-gradient-to-b from-[#fff8f0] via-[#fff1f2] to-[#fefce8] border-y border-[#fed7aa] relative overflow-hidden">
      
      {/* Decorative colorful ambient glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[550px] h-[400px] bg-rose-200/40 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[400px] bg-amber-200/40 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Top Header with Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-100 to-amber-100 text-rose-900 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Chef's Choice Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2a160d]">
              Featured Chocolates of the Week
            </h2>
            <p className="text-xs sm:text-sm text-[#7c5c47] mt-1">
              Hand-selected rotating favorites tempered in limited fresh quantities.
            </p>
          </div>

          {/* Rotation Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs text-[#7c5c47] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title={isAutoPlaying ? 'Pause rotation' : 'Resume auto-rotation'}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5 text-rose-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="hidden sm:inline font-bold">{isAutoPlaying ? 'Rotating' : 'Paused'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-[#2a160d] flex items-center justify-center transition-colors hover:text-rose-600 shadow-xs cursor-pointer"
                aria-label="Previous Featured Chocolate"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-[#2a160d] flex items-center justify-center transition-colors hover:text-rose-600 shadow-xs cursor-pointer"
                aria-label="Next Featured Chocolate"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Showcase Card with Colorful Theme */}
        <div className="bg-white border-2 border-rose-100 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl transition-all duration-500 bg-colorful-card-hover">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Product Image */}
            <div className="lg:col-span-5 relative group">
              <div className="relative aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden border border-rose-200 bg-rose-50/50 shadow-md">
                <img
                  src={current.image}
                  alt={current.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Badge */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {current.badge || 'Featured Batch'}
                  </span>
                  <span className="bg-white/95 backdrop-blur-md text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 shadow-xs">
                    {current.cocoaPercentage}% Cocoa
                  </span>
                </div>

                {/* Stock Level Warning */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-emerald-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs shadow-sm">
                  <span className="text-[#059669] flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Cocoa Butter
                  </span>
                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    Stock: {current.stock} boxes
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Product Narrative & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#2a160d]">{current.rating}</span>
                  <span className="text-xs text-[#7c5c47]">({current.reviewsCount} customer reviews)</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2a160d]">
                  {current.name}
                </h3>
                
                <p className="text-sm font-bold text-[#be123c] mt-1">
                  {current.tagline}
                </p>

                {current.featuredHighlight && (
                  <p className="text-xs text-[#92400e] bg-gradient-to-r from-[#fef3c7] to-[#fff1f2] border border-[#fde68a] px-3.5 py-1.5 rounded-xl inline-block mt-3 font-bold shadow-xs">
                    ✨ {current.featuredHighlight}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-[#5a3825] mt-3 leading-relaxed">
                  {current.description}
                </p>
              </div>

              {/* Colorful Ingredients & Dietary Badges */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-[#fbcfe8]">
                {current.dietary.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl font-bold shadow-xs"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>

              {/* Pricing & Order Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#fbcfe8]">
                <div>
                  <span className="text-xs text-[#7c5c47] font-semibold block">
                    Price ({popularBox.label}):
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-[#be123c]">
                      ₹{popularBox.price}
                    </span>
                    <span className="text-xs text-[#8c6550] font-medium">
                      ({popularBox.count})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onQuickOrder(current, popularBox)}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white text-xs sm:text-sm font-bold hover:opacity-95 shadow-md shadow-rose-600/25 flex items-center gap-2 cursor-pointer transition-all transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Order Now</span>
                  </button>

                  <button
                    onClick={() => onAddToCart(current, popularBox)}
                    className="px-5 py-3.5 rounded-2xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4 text-rose-600" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={() => onSelectChocolate(current)}
                    className="text-xs text-rose-700 hover:text-rose-900 underline underline-offset-4 font-bold transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        <div className="flex items-center justify-center gap-2.5 mt-6 overflow-x-auto pb-1">
          {featuredList.map((choc, idx) => (
            <button
              key={choc.id}
              onClick={() => {
                setCurrentIndex(idx);
                setIsAutoPlaying(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all text-xs cursor-pointer shadow-xs ${
                currentIndex === idx
                  ? 'bg-rose-500 border-rose-600 text-white font-bold shadow-md'
                  : 'bg-white border-rose-100 text-[#7c5c47] hover:text-rose-700 hover:border-rose-300'
              }`}
            >
              <img
                src={choc.image}
                alt={choc.name}
                className="w-5 h-5 rounded-md object-cover"
              />
              <span className="truncate max-w-[120px]">{choc.name.split(' ')[0]} {choc.name.split(' ')[1]}</span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
