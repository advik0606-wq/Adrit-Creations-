import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, UserCheck, LogOut, Package, Menu, X, ChevronDown, User as UserIcon } from 'lucide-react';
import { CartItem, Order } from '../types';
import { User } from 'firebase/auth';
import { SELLER_PHONE, SELLER_EMAIL } from '../services/gmailService';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  cart: CartItem[];
  orders: Order[];
  onOpenCart: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenSellerPortal: () => void;
  onOpenMyOrders: () => void;
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  isAuthenticating: boolean;
  reviewsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cart,
  orders,
  onOpenCart,
  onNavigate,
  onOpenSellerPortal,
  onOpenMyOrders,
  currentUser,
  onGoogleSignIn,
  onLogout,
  isAuthenticating,
  reviewsCount = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Security & Strict Access Control:
  // ONLY Sunita (neetuyadav30@gmail.com) is recognized as the seller/owner
  const isSeller = Boolean(
    currentUser?.email &&
    currentUser.email.toLowerCase().trim() === SELLER_EMAIL.toLowerCase().trim()
  );

  // Calculate orders placed by the current customer
  const customerEmail = currentUser?.email?.toLowerCase().trim();
  const customerOrdersCount = customerEmail
    ? orders.filter((o) => o.customer.email.toLowerCase().trim() === customerEmail).length
    : 0;

  // New orders count for the seller
  const pendingOrdersForSeller = orders.filter((o) => o.status === 'new').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs transition-all">
      {/* Top Colorful Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 text-white text-xs py-1.5 px-4 text-center shadow-xs flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
        <span className="font-semibold tracking-wide">
          100% Belgian Cocoa Butter &bull; Fresh Small Batches &bull; Order Directly With Sunita (Mom)
        </span>
        <span className="hidden md:inline-block text-yellow-200 font-bold">
          &bull; Phone / WhatsApp: {SELLER_PHONE}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <button
            onClick={() => onNavigate('hero')}
            className="flex items-center group text-left focus:outline-none cursor-pointer"
            aria-label="Adrit Creations Home"
          >
            <BrandLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-[#4a2e1b]">
            <button
              onClick={() => onNavigate('featured')}
              className="hover:text-rose-600 transition-colors py-1 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Featured</span>
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="hover:text-rose-600 transition-colors py-1 cursor-pointer"
            >
              All Chocolates
            </button>
            <button
              onClick={() => onNavigate('story')}
              className="hover:text-rose-600 transition-colors py-1 cursor-pointer"
            >
              Mom’s Story
            </button>
            <button
              onClick={() => onNavigate('reviews')}
              className="hover:text-rose-600 transition-colors py-1 cursor-pointer flex items-center gap-1.5"
            >
              <span>Reviews</span>
              {reviewsCount > 0 ? (
                <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {reviewsCount} ★
                </span>
              ) : (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  New
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('guarantee')}
              className="hover:text-rose-600 transition-colors py-1 cursor-pointer"
            >
              Quality Pledge
            </button>
          </nav>

          {/* Actions: Portal/Orders, Profile, Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* STRICT RBAC:
                1. If logged in as SELLER (neetuyadav30@gmail.com) -> Show "Mom's Portal"
                2. For ALL other users (customers & guests) -> Show "My Orders"
            */}
            {isSeller ? (
              <button
                onClick={onOpenSellerPortal}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-white shadow-md shadow-rose-500/20 hover:opacity-95 transition-all cursor-pointer animate-pulse"
                title="Sunita's Orders & Kitchen Portal (Store Owner)"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Mom’s Portal</span>
                <span className="sm:hidden">Portal</span>
                {pendingOrdersForSeller > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-rose-700 text-[10px] font-extrabold flex items-center justify-center">
                    {pendingOrdersForSeller}
                  </span>
                )}
              </button>
            ) : (
              /* Customer 'My Orders' Section */
              <button
                onClick={onOpenMyOrders}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 hover:from-rose-100 hover:to-amber-100 text-rose-900 border border-rose-200 transition-all shadow-xs cursor-pointer"
                title="View previous orders directly in your user profile"
              >
                <Package className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">My Orders</span>
                <span className="sm:hidden">Orders</span>
                {customerOrdersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {customerOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Google Profile or Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 bg-white border border-rose-200 rounded-full pl-1.5 pr-2.5 py-1 text-xs shadow-xs hover:border-rose-400 transition-all cursor-pointer"
                  title="Click to view User Profile & Account details"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User Profile'}
                      className="w-6 h-6 rounded-full border border-rose-300 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-bold">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[75px] sm:max-w-[95px] truncate text-[#2a160d] font-bold text-left">
                    {currentUser.displayName?.split(' ')[0] || 'Profile'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#7c5c47]" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-rose-100 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn text-[#2c180e]">
                    <div className="border-b border-rose-100 pb-2.5 mb-2 px-1">
                      <p className="font-serif font-bold text-sm text-[#2a160d] truncate">
                        {currentUser.displayName || 'Chocolate Connoisseur'}
                      </p>
                      <p className="text-[11px] text-[#7c5c47] truncate">
                        {currentUser.email}
                      </p>
                      {isSeller ? (
                        <span className="mt-1 inline-block text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Store Owner & Chef
                        </span>
                      ) : (
                        <span className="mt-1 inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Customer Account
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onOpenMyOrders();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-rose-950 hover:bg-rose-50 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-rose-600" />
                          <span>My Orders & Tracking</span>
                        </span>
                        {customerOrdersCount > 0 && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                            {customerOrdersCount}
                          </span>
                        )}
                      </button>

                      {isSeller && (
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            onOpenSellerPortal();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>Mom’s Kitchen Portal</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors pt-2 border-t border-rose-100 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                disabled={isAuthenticating}
                className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full bg-white text-[#2a160d] hover:bg-rose-50 border border-rose-200 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                title="Sign in with Google"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Connecting...' : 'Sign in'}</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 text-white hover:opacity-95 shadow-md shadow-rose-500/25 transition-all transform active:scale-95 cursor-pointer shrink-0"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl text-[#4a2e1b] hover:bg-rose-50 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-rose-100 bg-white/98 backdrop-blur-md px-5 py-4 space-y-3 animate-fadeIn">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-[#4a2e1b]">
            <button
              onClick={() => {
                onNavigate('featured');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-rose-600 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Featured Chocolates</span>
            </button>
            <button
              onClick={() => {
                onNavigate('catalog');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-rose-600 cursor-pointer"
            >
              Complete Chocolate Catalog
            </button>
            <button
              onClick={() => {
                onNavigate('story');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-rose-600 cursor-pointer"
            >
              Mom’s Story & Kitchen Care
            </button>
            <button
              onClick={() => {
                onNavigate('reviews');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-rose-600 cursor-pointer"
            >
              Customer Reviews (4.9 ★)
            </button>
            <button
              onClick={() => {
                onNavigate('guarantee');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-rose-600 cursor-pointer"
            >
              Pure Cocoa Butter Guarantee
            </button>

            {/* Mobile My Orders button */}
            <button
              onClick={() => {
                onOpenMyOrders();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-rose-50 text-rose-900 font-bold flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-rose-600" />
                <span>My Orders & Live Tracking</span>
              </span>
              {customerOrdersCount > 0 && (
                <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {customerOrdersCount}
                </span>
              )}
            </button>

            {/* Mobile Owner Portal Button (ONLY for Sunita) */}
            {isSeller && (
              <button
                onClick={() => {
                  onOpenSellerPortal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Mom’s Kitchen Orders Portal</span>
              </button>
            )}

            {!currentUser && (
              <button
                onClick={() => {
                  onGoogleSignIn();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 mt-2 rounded-xl border border-rose-200 text-[#2a160d] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer bg-white"
              >
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
