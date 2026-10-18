import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Filter, ShoppingBag, Eye, Check, Star, AlertTriangle } from 'lucide-react';
import { Chocolate, Category, BoxOption } from '../types';

interface ProductCatalogProps {
  chocolates: Chocolate[];
  onSelectChocolate: (chocolate: Chocolate) => void;
  onQuickOrder: (chocolate: Chocolate, selectedBox: BoxOption) => void;
  onAddToCart: (chocolate: Chocolate, selectedBox: BoxOption) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  chocolates,
  onSelectChocolate,
  onQuickOrder,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  
  // Track selected box option per chocolate card
  const [selectedBoxes, setSelectedBoxes] = useState<Record<string, BoxOption>>(() => {
    const initial: Record<string, BoxOption> = {};
    chocolates.forEach((c) => {
      const popular = c.boxOptions.find((b) => b.popular) || c.boxOptions[0];
      initial[c.id] = popular;
    });
    return initial;
  });

  const [addedItemEffect, setAddedItemEffect] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Creations', count: chocolates.length, activeClass: 'bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 text-white shadow-md' },
    { id: 'truffles', label: 'Truffles & Ganache', count: chocolates.filter(c => c.category === 'truffles').length, activeClass: 'bg-rose-600 text-white shadow-md' },
    { id: 'nuts', label: 'Roasted Nut Rocks', count: chocolates.filter(c => c.category === 'nuts').length, activeClass: 'bg-amber-600 text-white shadow-md' },
    { id: 'hampers', label: 'Gift Hampers', count: chocolates.filter(c => c.category === 'hampers').length, activeClass: 'bg-purple-600 text-white shadow-md' },
    { id: 'bonbons', label: 'Artisan Bonbons', count: chocolates.filter(c => c.category === 'bonbons').length, activeClass: 'bg-emerald-600 text-white shadow-md' },
    { id: 'dark', label: 'Dark 70%-80%', count: chocolates.filter(c => c.category === 'dark').length, activeClass: 'bg-stone-800 text-white shadow-md' },
    { id: 'sugarfree', label: 'Sugar-Free & Keto', count: chocolates.filter(c => c.category === 'sugarfree').length, activeClass: 'bg-teal-600 text-white shadow-md' },
  ];

  const filteredChocolates = useMemo(() => {
    return chocolates.filter((choc) => {
      if (selectedCategory !== 'all' && choc.category !== selectedCategory) {
        return false;
      }
      if (selectedDietary !== 'all') {
        if (!choc.dietary.includes(selectedDietary)) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = choc.name.toLowerCase().includes(query);
        const matchesDesc = choc.description.toLowerCase().includes(query);
        const matchesTagline = choc.tagline.toLowerCase().includes(query);
        const matchesIngredients = choc.ingredients.some((i) => i.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesTagline || matchesIngredients;
      }
      return true;
    });
  }, [chocolates, selectedCategory, selectedDietary, searchQuery]);

  const handleBoxChange = (chocolateId: string, box: BoxOption) => {
    setSelectedBoxes((prev) => ({
      ...prev,
      [chocolateId]: box,
    }));
  };

  const handleAddToCartClick = (chocolate: Chocolate) => {
    if (chocolate.stock <= 0) return;
    const box = selectedBoxes[chocolate.id] || chocolate.boxOptions[0];
    onAddToCart(chocolate, box);
    setAddedItemEffect(chocolate.id);
    setTimeout(() => {
      setAddedItemEffect(null);
    }, 1500);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'truffles':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'nuts':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'hampers':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'bonbons':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'sugarfree':
        return 'bg-teal-100 text-teal-900 border-teal-200';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-200';
    }
  };

  return (
    <section id="catalog" className="py-16 md:py-24 bg-colorful-mesh relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 text-rose-900 text-xs font-bold uppercase tracking-wider mb-3 border border-rose-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>The Handcrafted Collection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2a160d] tracking-tight">
            Artisanal Chocolate Catalog
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5a3825] leading-relaxed">
            Every recipe is prepared from scratch in mom’s home kitchen. Select any chocolate to order directly with custom box sizes, handwritten cards, and doorstep delivery with instant email confirmation.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4 mb-10">
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flavors, roasted nuts, dark %..."
                className="w-full bg-white border border-rose-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-[#2a160d] placeholder-[#8c6550] focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-rose-600 hover:text-rose-800 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dietary Filter Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              <span className="text-[#7c5c47] whitespace-nowrap flex items-center gap-1 font-bold">
                <Filter className="w-3.5 h-3.5 text-rose-600" /> Diet:
              </span>
              {['all', 'Eggless', '100% Cocoa Butter', 'Sugar Free', 'Gluten Free'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedDietary(tag)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-semibold cursor-pointer ${
                    selectedDietary === tag
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : 'bg-white text-[#5c3722] hover:bg-rose-50 border border-rose-200'
                  }`}
                >
                  {tag === 'all' ? 'All Diets' : tag}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs with Individual Cheerful Colors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as Category)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                    isActive
                      ? cat.activeClass
                      : 'bg-white text-[#5c3722] hover:text-rose-700 hover:bg-rose-50 border border-rose-100'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-[#7c5c47] mb-6 px-1">
          <span className="font-semibold text-rose-900">Showing {filteredChocolates.length} creations</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            🚚 Ships fresh in insulated cold pack &bull; Confirmation emailed to you
          </span>
        </div>

        {/* Chocolates Grid with Colorful Cards */}
        {filteredChocolates.length === 0 ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-12 text-center text-[#5c3722] shadow-sm">
            <p className="text-lg font-serif mb-2 font-bold text-[#2a160d]">No chocolates match your search or filter</p>
            <p className="text-sm text-[#7c5c47] mb-4">Try searching for "dark", "almond", or selecting "All Creations".</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDietary('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredChocolates.map((chocolate) => {
              const currentBox = selectedBoxes[chocolate.id] || chocolate.boxOptions[0];
              const isAddedJustNow = addedItemEffect === chocolate.id;
              const isOut = chocolate.stock <= 0;
              const isLow = chocolate.stock > 0 && chocolate.stock <= chocolate.lowStockThreshold;

              return (
                <div
                  key={chocolate.id}
                  className="group bg-white rounded-3xl border-2 border-rose-100 hover:border-rose-400 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden bg-colorful-card-hover"
                >
                  {/* Image Container */}
                  <div 
                    className="relative aspect-[4/3] overflow-hidden bg-rose-50 cursor-pointer"
                    onClick={() => onSelectChocolate(chocolate)}
                  >
                    <img
                      src={chocolate.image}
                      alt={chocolate.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

                    {/* Badge top left */}
                    {chocolate.badge && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                        {chocolate.badge}
                      </span>
                    )}

                    {/* Cocoa % pill top right */}
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-amber-200 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {chocolate.cocoaPercentage}% Cocoa
                    </span>

                    {/* Stock status overlay */}
                    <div className="absolute bottom-3 left-3">
                      {isOut ? (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                          Sold Out
                        </span>
                      ) : isLow ? (
                        <span className="bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Only {chocolate.stock} left!
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                          In Stock ({chocolate.stock})
                        </span>
                      )}
                    </div>

                    {/* Quick view hover icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChocolate(chocolate);
                      }}
                      className="absolute bottom-3 right-3 bg-white/90 text-rose-700 hover:text-rose-900 p-2 rounded-full border border-rose-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div>
                      {/* Rating & Fresh Batch */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-[#2a160d]">{chocolate.rating}</span>
                          <span className="text-[#7c5c47]">({chocolate.reviewsCount} reviews)</span>
                        </div>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Fresh Batch
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3
                        onClick={() => onSelectChocolate(chocolate)}
                        className="text-lg font-serif font-bold text-[#2a160d] group-hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        {chocolate.name}
                      </h3>
                      <p className="text-xs text-[#5a3825] mt-1 line-clamp-2">
                        {chocolate.tagline}
                      </p>

                      {/* Dietary Badges with Category Accent */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border ${getCategoryBadgeClass(chocolate.category)}`}>
                          {chocolate.category.toUpperCase()}
                        </span>
                        {chocolate.dietary.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded-lg font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Box Size Selector and Pricing */}
                    <div className="pt-3 border-t border-rose-100 space-y-3">
                      
                      {/* Box option select */}
                      <div>
                        <label className="block text-[11px] text-[#7c5c47] mb-1 font-bold">
                          Select Box Size:
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {chocolate.boxOptions.map((opt) => {
                            const isBoxActive = currentBox.label === opt.label;
                            return (
                              <button
                                key={opt.label}
                                onClick={() => handleBoxChange(chocolate.id, opt)}
                                className={`text-[11px] p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                                  isBoxActive
                                    ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold shadow-xs'
                                    : 'bg-white border-[#ebd9c8] text-[#7c5c47] hover:border-rose-300'
                                }`}
                              >
                                <div className="truncate font-semibold">{opt.label.split(' ')[0]}</div>
                                <div className="text-[10px] text-rose-700 font-bold">₹{opt.price}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Price & Active Box details */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold font-serif text-[#be123c]">
                            ₹{currentBox.price}
                          </span>
                          <span className="text-[11px] text-[#7c5c47] ml-1.5 font-medium">
                            ({currentBox.count})
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                          Free Ribbon
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => onQuickOrder(chocolate, currentBox)}
                          disabled={isOut}
                          className="w-full py-2.5 px-2 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>{isOut ? 'Sold Out' : 'Order Now'}</span>
                        </button>

                        <button
                          onClick={() => handleAddToCartClick(chocolate)}
                          disabled={isOut}
                          className={`w-full py-2.5 px-2 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            isAddedJustNow
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white hover:bg-rose-50 border-rose-200 text-rose-900 shadow-xs'
                          }`}
                        >
                          {isAddedJustNow ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
                              <span>Add to Box</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>

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
