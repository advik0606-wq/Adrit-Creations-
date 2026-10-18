import React from 'react';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const MomsStory: React.FC = () => {
  return (
    <section id="story" className="py-16 md:py-24 bg-gradient-to-b from-[#fffbf5] via-[#fff1f2] to-[#faf5ee] relative overflow-hidden border-t border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Showcase: Mom's Kitchen Crafting */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              <div className="relative rounded-3xl overflow-hidden border-2 border-rose-200 bg-white shadow-2xl">
                <img
                  src="/src/assets/images/potli_sunflower_bag_1792331238306.jpg"
                  alt="Sunita handcrafting 100% handmade crochet creations and chocolates in her workshop"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover object-center filter saturate-110"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Floating Story Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-rose-200 rounded-2xl p-4 shadow-xl text-[#2a160d]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                      <Heart className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#2a160d]">
                        Sunita Yadav & Adrit
                      </h4>
                      <p className="text-[11px] text-rose-800 font-semibold">
                        Founder & Chocolatière, Adrit Creations
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#523321] italic mt-2.5 leading-snug">
                    "When you cook from the heart for family, you never cut corners on ingredients. That’s the exact philosophy behind every box of Adrit Creations."
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* Story Narrative & The Homemade Difference */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 text-rose-900 text-xs font-bold uppercase tracking-wider border border-rose-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Meet the Maker</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2a160d] tracking-tight">
              From a Mother’s Kitchen to Your Sweetest Celebrations
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#5a3825] leading-relaxed">
              <p>
                Adrit Creations began as a labor of love. What started as handcrafted festive gifts for cousins and close friends during festivals soon turned into repeated requests for birthdays, baby announcements, and intimate gatherings.
              </p>
              <p>
                Sunita noticed that most commercial supermarket chocolates are loaded with hydrogenated vegetable fats, artificial emulsifiers, and sit on warehouse shelves for months. She wanted to give people real, fresh, honest chocolate—the kind that melts cleanly on the palate because it uses <strong className="text-rose-900 font-bold">100% pure cocoa butter</strong> and real fresh cream.
              </p>
              <p>
                Every chocolate is prepared in small batches of no more than 20 boxes at a time, featuring our 4 signature recipes: intense 70% Dark Chocolate, roasted green Pista (Pistachio), golden caramelized Pineapple, and velvety Strawberry White Chocolate.
              </p>
              <p>
                Beyond her confectionery, Sunita also hand-knits delicate crochet art—creating sunny sunflower potli bags, floral hair pins, cherry bell bag charms, and keychains with soft cotton milk yarn. It’s the heartwarming personal touch that turns every Adrit Creations package into an unforgettable heirloom gift.
              </p>
            </div>

            {/* Comparison Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 space-y-2 shadow-xs">
                <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block">
                  ✨ The Adrit Standard
                </span>
                <ul className="text-xs space-y-1.5 text-emerald-950 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Pure Belgian Cocoa Butter (Zero Palm Oil)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Slow-roasted California nuts & spices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Made fresh on your order within 24 hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Personalized handwritten gift notes</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 rounded-2xl p-4 space-y-2 text-[#7c5c47] shadow-xs">
                <span className="text-xs uppercase tracking-wider text-rose-800 font-bold block">
                  🚫 Typical Factory Chocolates
                </span>
                <ul className="text-xs space-y-1.5 text-rose-900 font-medium">
                  <li>• High vegetable fat / hydrogenated oils</li>
                  <li>• Chemical preservatives & artificial emulsifiers</li>
                  <li>• Sits in warehouse storages for 6-12 months</li>
                  <li>• Generic mass packaging without personal care</li>
                </ul>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
