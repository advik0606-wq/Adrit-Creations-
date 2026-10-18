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
  const [selectedMouldShape, setSelectedMouldShape] = useState<string>('all');
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
    { id: 'all', label: 'All Products', count: chocolates.length, activeClass: 'bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 text-white shadow-md' },
    { id: 'crochet', label: '🧶 Crochet Boutique', count: chocolates.filter(c => c.category === 'crochet' || c.productType === 'crochet').length, activeClass: 'bg-amber-600 text-white shadow-md' },
    { id: 'dark', label: '🍫 Dark Chocolate', count: chocolates.filter(c => c.flavour === 'dark' || c.category === 'dark').length, activeClass: 'bg-stone-800 text-white shadow-md' },
    { id: 'pista', label: '💚 Pista (Pistachio)', count: chocolates.filter(c => c.flavour === 'pista').length, activeClass: 'bg-emerald-700 text-white shadow-md' },
    { id: 'pineapple', label: '🍍 Pineapple', count: chocolates.filter(c => c.flavour === 'pineapple').length, activeClass: 'bg-yellow-600 text-white shadow-md' },
    { id: 'strawberry', label: '🍓 Strawberry White', count: chocolates.filter(c => c.flavour === 'strawberry-white').length, activeClass: 'bg-pink-600 text-white shadow-md' },
    { id: 'hampers', label: '🎁 Combos & Hampers', count: chocolates.filter(c => c.category === 'hampers').length, activeClass: 'bg-purple-600 text-white shadow-md' },
  ];

  const mouldShapes = [
    { id: 'all', label: 'All Creations' },
    { id: 'Sunflower', label: '🌻 Sunflower (Potli & Keychains)' },
    { id: 'Flower', label: '🌸 Flower Hair Clips' },
    { id: 'Bell', label: '🔔 Bell Bag Charms' },
    { id: 'Heart', label: '♥ 3D Heart Mould' },
    { id: 'Gem', label: '💎 Diamond Gem Mould' },
    { id: 'Dome', label: '✨ Spherical Dome' },
  ];

  const filteredChocolates = useMemo(() => {
    return chocolates.filter((choc) => {
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'crochet') {
          if (choc.category !== 'crochet' && choc.productType !== 'crochet') return false;
        } else if (selectedCategory === 'dark') {
          if (choc.flavour !== 'dark' && choc.category !== 'dark') return false;
        } else if (selectedCategory === 'pista') {
          if (choc.flavour !== 'pista') return false;
        } else if (selectedCategory === 'pineapple') {
          if (choc.flavour !== 'pineapple') return false;
        } else if (selectedCategory === 'strawberry') {
          if (choc.flavour !== 'strawberry-white') return false;
        } else if (selectedCategory === 'hampers') {
          if (choc.category !== 'hampers') return false;
        } else if (choc.category !== selectedCategory) {
          return false;
        }
      }
      if (selectedMouldShape !== 'all') {
        const shape = `${choc.name} ${choc.mouldShape || ''}`.toLowerCase();
        if (!shape.includes(selectedMouldShape.toLowerCase())) return false;
      }
      if (selectedDietary !== 'all') {
        if (!choc.dietary.includes(selectedDietary)) return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = choc.name.toLowerCase().includes(query);
        const matchesDesc = choc.description.toLowerCase().includes(query);
        const matchesTagline = choc.tagline.toLowerCase().includes(query);
        const matchesMould = (choc.mouldShape || '').toLowerCase().includes(query) || (choc.mouldType || '').toLowerCase().includes(query);
        const matchesFlavour = (choc.flavour || '').toLowerCase().includes(query);
        const matchesIngredients = choc.ingredients.some((i) => i.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesTagline || matchesMould || matchesFlavour || matchesIngredients;
      }
      return true;
    });
  }, [chocolates, selectedCategory, selectedMouldShape, selectedDietary, searchQuery]);

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
      case 'crochet':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold';
      case 'dark':
        return 'bg-stone-800 text-stone-100 border-stone-700';
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
        return 'bg-rose-100 text-rose-900 border-rose-200';
    }
  };

  return (
    <section id="catalog" className="py-16 md:py-24 bg-colorful-mesh relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 text-rose-900 text-xs font-bold uppercase tracking-wider mb-3 border border-rose-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Chocolates & Handmade Crochet Boutique</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2a160d] tracking-tight">
            Artisanal Confectionery & Crochet Crafts
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5a3825] leading-relaxed">
            Every creation is lovingly handcrafted at home by Sunita: from our 4 signature chocolate flavours (<strong className="text-rose-900">Dark Chocolate, Pista, Pineapple, Strawberry White</strong>) poured into tempered moulds, to delicate crochet works (<strong className="text-amber-900">Sunflower Potli Bags, Flower Hair Clips, Bell Flower Bag Charms & Keychains</strong>).
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

          {/* Mould Shape Quick Filter Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            <span className="text-[#6b4733] font-bold whitespace-nowrap flex items-center gap-1 pl-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Mould:
            </span>
            {mouldShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setSelectedMouldShape(shape.id)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all font-semibold cursor-pointer border ${
                  selectedMouldShape === shape.id
                    ? 'bg-amber-600 text-white font-bold border-amber-600 shadow-xs'
                    : 'bg-amber-50/70 hover:bg-amber-100 text-amber-950 border-amber-200/80'
                }`}
              >
                {shape.label}
              </button>
            ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
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
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

                    {/* Badge top left */}
                    {chocolate.badge && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                        {chocolate.badge}
                      </span>
                    )}

                    {/* Badge top right: 100% Handmade or Cocoa % */}
                    {chocolate.productType === 'crochet' ? (
                      <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-200">
                        🧶 100% Handmade
                      </span>
                    ) : chocolate.cocoaPercentage > 0 ? (
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-amber-200 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {chocolate.cocoaPercentage}% Cocoa
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-rose-200 text-rose-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        Pure Couverture
                      </span>
                    )}

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
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div>
                      {/* Rating & Fresh Batch */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-[#2a160d]">{chocolate.rating}</span>
                          <span className="text-[#7c5c47]">({chocolate.reviewsCount} reviews)</span>
                        </div>
                        {chocolate.productType === 'crochet' ? (
                          <span className="text-[10px] text-amber-900 font-extrabold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                            100% Handmade
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Fresh Batch
                          </span>
                        )}
                      </div>

                      {/* Title & Tagline */}
                      <h3
                        onClick={() => onSelectChocolate(chocolate)}
                        className="text-base sm:text-lg font-serif font-bold text-[#2a160d] group-hover:text-rose-700 transition-colors cursor-pointer leading-snug"
                      >
                        {chocolate.name}
                      </h3>
                      <p className="text-xs text-[#5a3825] mt-1 line-clamp-2">
                        {chocolate.tagline}
                      </p>

                      {/* Dietary / Craft Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {chocolate.productType === 'crochet' ? (
                          <span className="text-[10px] bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-lg font-extrabold shadow-2xs">
                            🧶 100% HANDMADE
                          </span>
                        ) : (
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border ${getCategoryBadgeClass(chocolate.category)}`}>
                            {chocolate.category.toUpperCase()}
                          </span>
                        )}
                        {chocolate.dietary.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-rose-50 text-rose-800 border border-rose-100 px-2 py-0.5 rounded-lg font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Mould Shape & Craft Tag */}
                      {chocolate.productType === 'crochet' ? (
                        <div className="mt-2.5 flex items-center justify-between gap-1 text-[11px] bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 px-2.5 py-1.5 rounded-xl text-amber-950">
                          <span className="flex items-center gap-1 font-semibold truncate">
                            <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">Craft: <strong className="text-amber-900 font-bold">100% Handmade Yarn</strong></span>
                          </span>
                          <span className="text-[9px] bg-white border border-amber-300 text-amber-900 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                            Pure Cotton
                          </span>
                        </div>
                      ) : chocolate.mouldShape ? (
                        <div className="mt-2.5 flex items-center justify-between gap-1 text-[11px] bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 px-2.5 py-1 rounded-xl text-amber-950">
                          <span className="flex items-center gap-1 font-semibold truncate">
                            <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">Mould: <strong className="text-rose-900 font-bold">{chocolate.mouldShape}</strong></span>
                          </span>
                          {chocolate.mouldType && (
                            <span className="text-[9px] bg-white border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                              {chocolate.mouldType.replace(' Mould', '')}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Box Size Selector and Pricing */}
                    <div className="pt-3 border-t border-rose-100 space-y-3">
                      
                      {/* Box option select */}
                      <div>
                        <label className="block text-[11px] text-[#7c5c47] mb-1 font-bold">
                          {chocolate.productType === 'crochet' ? 'Select Option / Pack:' : 'Select Box Size:'}
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
