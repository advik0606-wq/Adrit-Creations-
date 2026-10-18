import React, { useState } from 'react';
import { X, Sparkles, Star, CheckCircle2, ShoppingBag, Clock } from 'lucide-react';
import { Chocolate, BoxOption } from '../types';

interface ProductDetailModalProps {
  chocolate: Chocolate | null;
  isOpen: boolean;
  onClose: () => void;
  onQuickOrder: (chocolate: Chocolate, selectedBox: BoxOption) => void;
  onAddToCart: (chocolate: Chocolate, selectedBox: BoxOption) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  chocolate,
  isOpen,
  onClose,
  onQuickOrder,
  onAddToCart,
}) => {
  if (!isOpen || !chocolate) return null;

  const [selectedBox, setSelectedBox] = useState<BoxOption>(
    chocolate.boxOptions.find((b) => b.popular) || chocolate.boxOptions[0]
  );
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(chocolate, selectedBox);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border-2 border-rose-200 rounded-3xl shadow-2xl overflow-hidden text-[#2c180e] my-8 max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 text-rose-700 hover:text-rose-900 flex items-center justify-center transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 bg-gradient-to-b from-[#fffbf7] to-white">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Image & Badges */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-rose-100 bg-rose-50 shadow-md">
                <img
                  src={chocolate.image}
                  alt={chocolate.name}
                  className="w-full h-full object-cover filter saturate-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {chocolate.badge && (
                    <span className="bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                      {chocolate.badge}
                    </span>
                  )}
                  <span className="bg-white/95 backdrop-blur-sm text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-200 shadow-xs">
                    {chocolate.cocoaPercentage}% Belgian Cocoa
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#2a160d] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-rose-200 shadow-sm">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Cocoa Butter
                  </span>
                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    Eggless Recipe
                  </span>
                </div>
              </div>

              {/* Shelf Life & Storage */}
              <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Fresh Shelf Life & Storage</span>
                </div>
                <p className="font-medium">{chocolate.shelfLife}</p>
                <p className="text-[11px] text-amber-800">
                  Store in a cool dry place (18°C) away from direct sun.
                </p>
              </div>
            </div>

            {/* Product Details & Selection */}
            <div className="space-y-5 flex flex-col justify-between">
              
              <div>
                {/* Rating */}
                <div className="flex items-center gap-2 text-xs mb-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                    <span className="font-bold text-[#2a160d] ml-1">{chocolate.rating}</span>
                  </div>
                  <span className="text-[#7c5c47]">({chocolate.reviewsCount} verified reviews)</span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-[#2a160d]">
                  {chocolate.name}
                </h3>
                <p className="text-xs text-rose-700 font-bold mt-1">
                  {chocolate.tagline}
                </p>

                <p className="text-xs sm:text-sm text-[#5a3825] mt-3 leading-relaxed">
                  {chocolate.description}
                </p>

                {/* Pure Kitchen Ingredients */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-2">
                    Pure Kitchen Ingredients:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {chocolate.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="text-[11px] bg-rose-50 border border-rose-200 text-rose-900 px-2.5 py-1 rounded-xl font-semibold shadow-xs"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dietary Tags */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                    Dietary Assurances:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {chocolate.dietary.map((d) => (
                      <span
                        key={d}
                        className="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-0.5 rounded-full font-bold shadow-xs"
                      >
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box Size Options Selection */}
              <div className="space-y-3 pt-3 border-t border-rose-100">
                <label className="block text-xs font-bold text-[#7c5c47]">
                  Select Box Size & Price:
                </label>
                <div className="space-y-2">
                  {chocolate.boxOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedBox(opt)}
                      className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedBox.label === opt.label
                          ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-xs'
                          : 'bg-white border-[#ebd9c8] text-[#6b4733] hover:border-rose-300'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-[#2a160d]">{opt.label}</span>
                        <span className="text-[#7c5c47] ml-2">({opt.count})</span>
                        {opt.popular && (
                          <span className="ml-2 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            Most Loved
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-rose-700">₹{opt.price}</span>
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onQuickOrder(chocolate, selectedBox);
                    }}
                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Instant Order</span>
                  </button>

                  <button
                    onClick={handleAdd}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                      justAdded
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white hover:bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-rose-600" />
                    <span>{justAdded ? 'Added to Box!' : 'Add to Box'}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
