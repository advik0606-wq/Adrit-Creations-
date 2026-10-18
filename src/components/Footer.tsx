import React from 'react';
import { Mail, Phone, MapPin, Heart, ShieldCheck, Sparkles, Package } from 'lucide-react';
import { SELLER_EMAIL, SELLER_PHONE } from '../services/gmailService';
import { BrandLogo } from './BrandLogo';
import { User } from 'firebase/auth';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenSellerPortal: () => void;
  onOpenMyOrders?: () => void;
  currentUser?: User | null;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenSellerPortal, 
  onOpenMyOrders,
  currentUser 
}) => {
  const isSeller = Boolean(
    currentUser?.email &&
    currentUser.email.toLowerCase().trim() === SELLER_EMAIL.toLowerCase().trim()
  );

  return (
    <footer className="bg-gradient-to-b from-[#fff8f0] via-[#fff1f2] to-[#faf5ee] border-t-2 border-rose-200 text-[#5c3722] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Story Summary with New Bespoke Logo */}
          <div className="space-y-4">
            <BrandLogo size="sm" />

            <p className="text-xs leading-relaxed text-[#6b4733]">
              Born in Sunita’s kitchen, Adrit Creations celebrates the authentic beauty of Belgian couverture, slow-roasted nuts, and small-batch confectionery. Tempered fresh on your order.
            </p>

            <div className="inline-flex items-center gap-2 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Pure Cocoa Butter Guarantee</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2a160d] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Explore Collection</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('featured')}
                  className="hover:text-rose-600 transition-colors cursor-pointer font-medium text-left"
                >
                  Featured Chocolates of the Week
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-rose-600 transition-colors cursor-pointer font-medium text-left"
                >
                  Belgian Dark Truffles (70%)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-rose-600 transition-colors cursor-pointer font-medium text-left"
                >
                  Roasted Almond & Sea Salt Rocks
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-rose-600 transition-colors cursor-pointer font-medium text-left"
                >
                  Luxury Assorted Gift Hampers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('story')}
                  className="hover:text-rose-600 transition-colors cursor-pointer font-medium text-left"
                >
                  Sunita's Story & Pure Tempering
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support & Orders Access */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2a160d] uppercase tracking-wider">
              Customer Orders & Care
            </h4>
            <div className="space-y-2 text-[#6b4733]">
              <p className="leading-relaxed">
                When you order, a confirmation email is sent to your inbox and Sunita receives your order details. She will contact you directly to confirm delivery and take payment (UPI or Cash).
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {onOpenMyOrders && (
                <button
                  onClick={onOpenMyOrders}
                  className="text-xs text-rose-800 hover:text-rose-950 flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-rose-600" />
                  <span>View My Orders & Live Tracking &rarr;</span>
                </button>
              )}

              {/* ONLY show Mom's Portal link if the logged in user is Sunita */}
              {isSeller && (
                <button
                  onClick={onOpenSellerPortal}
                  className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sunita’s Orders & Kitchen Portal &rarr;</span>
                </button>
              )}
            </div>
          </div>

          {/* Contact Direct with Phone +91 9971921200 */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif font-bold text-sm text-[#2a160d] uppercase tracking-wider">
              Contact Sunita (Mom)
            </h4>
            <div className="space-y-2.5 text-[#6b4733]">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                <a href={`tel:${SELLER_PHONE.replace(/[^0-9+]/g, '')}`} className="hover:text-rose-700 font-bold text-[#2a160d] transition-colors">
                  {SELLER_PHONE} (Call / WhatsApp)
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <a href={`mailto:${SELLER_EMAIL}`} className="hover:text-rose-700 font-bold transition-colors">
                  {SELLER_EMAIL}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Home Kitchen: New Delhi, India</span>
              </p>
            </div>

            <p className="text-[11px] text-[#8c6550] pt-2">
              Kitchen open 7 days a week &bull; 9:00 AM – 9:00 PM for custom chocolate inquiries.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-rose-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7c5c47] gap-4">
          <p>© {new Date().getFullYear()} Adrit Creations. Handcrafted fresh with love.</p>
          <p className="flex items-center gap-1">
            <span>Made with 100% Belgian cocoa butter &</span>
            <Heart className="w-3.5 h-3.5 text-[#e11d48] fill-current" />
            <span>by Sunita & Family</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
