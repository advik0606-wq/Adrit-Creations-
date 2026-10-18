import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Heart, Star } from 'lucide-react';
import { SELLER_PHONE } from '../services/gmailService';

interface HeroProps {
  onExploreCatalog: () => void;
  onOpenStory: () => void;
  onQuickCustomOrder: () => void;
  onExploreFeatured: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreCatalog,
  onOpenStory,
  onExploreFeatured,
}) => {
  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 bg-colorful-hero">
      {/* Background colorful ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/30 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-300/30 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-200/30 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 border border-rose-200 text-rose-900 text-xs font-bold tracking-wide shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>Chocolates & Handmade Crochet Boutique &bull; Small Batch Crafts by Mom</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2a160d] leading-[1.18] sm:leading-[1.15] tracking-tight">
              Chocolates & Crochet Crafts,{' '}
              <span className="italic bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 bg-clip-text text-transparent">
                Handcrafted with Love.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-[#5a3825] leading-relaxed max-w-2xl font-normal">
              Welcome to <strong className="text-rose-900 font-bold">Adrit Creations</strong>. Everything is lovingly handmade by Sunita (Mom): from artisanal chocolates in our 4 signature flavours (<strong className="text-rose-900">Dark Chocolate, Pista, Pineapple & Strawberry White</strong>) to our charming crochet boutique (<strong className="text-amber-900">Sunflower Potli Bags, Flower Hair Clips, Bell Bag Charms & Keychains</strong>).
            </p>

            {/* Colorful Key Value Points */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 backdrop-blur-sm border border-emerald-200 p-2 sm:p-2.5 rounded-2xl shadow-xs text-emerald-900">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">4 Flavours</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 backdrop-blur-sm border border-amber-200 p-2 sm:p-2.5 rounded-2xl shadow-xs text-amber-900">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">100% Handmade</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 bg-white/90 backdrop-blur-sm border border-rose-200 p-2.5 rounded-2xl shadow-xs col-span-2 sm:col-span-1 text-rose-900">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs sm:text-sm">Direct with Mom</span>
              </div>
            </div>

            {/* Action Buttons: Responsive full width on mobile, inline on tablet/desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-3">
              <button
                onClick={onExploreFeatured}
                className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white font-bold text-sm sm:text-base hover:opacity-95 shadow-lg shadow-rose-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Featured Creations</span>
              </button>

              <button
                onClick={onExploreCatalog}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white hover:bg-rose-50 text-[#2a160d] border border-rose-200 font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Browse Full Catalog</span>
                <ArrowRight className="w-4 h-4 text-rose-600" />
              </button>

              <button
                onClick={onOpenStory}
                className="text-center sm:text-left text-xs sm:text-sm text-rose-700 hover:text-rose-900 underline underline-offset-4 font-bold transition-colors cursor-pointer py-1"
              >
                Mom’s Story &rarr;
              </button>
            </div>

            {/* Contact quick strip */}
            <div className="pt-4 border-t border-rose-200/80 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-[#7c5c47]">
              <span>Direct Kitchen Line: <strong className="text-rose-900 font-bold">{SELLER_PHONE}</strong></span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="text-emerald-700 font-semibold">Payment on contact &bull; Email receipt to buyer</span>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              <div className="relative rounded-3xl overflow-hidden border-2 border-rose-200 bg-white shadow-2xl">
                <img
                  src="/src/assets/images/four_flavour_chocolates_1792329979274.jpg"
                  alt="Adrit Creations Handcrafted Chocolates and Crochet"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 md:h-96 lg:h-[400px] object-cover object-center filter saturate-110 hover:scale-105 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                {/* Floating badge */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-white/95 backdrop-blur-md border border-rose-200 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-rose-900 font-bold shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Small Batch from Sunita's Kitchen</span>
                </div>

                {/* Floating Review Quote */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 bg-white/95 backdrop-blur-md border border-rose-200 rounded-2xl p-3 sm:p-4 shadow-lg text-[#2a160d]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      Verified Purchase
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#3b2012] italic font-serif leading-snug">
                    "Tastes ten times better than store chocolates. The pistachio praline and sunflower potli bag are pure perfection!"
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-rose-800 mt-1.5 font-bold">
                    — Priya Sharma, New Delhi
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
