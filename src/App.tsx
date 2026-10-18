import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedChocolates } from './components/FeaturedChocolates';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { QuickOrderModal } from './components/QuickOrderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ReviewsSection } from './components/ReviewsSection';
import { MomsStory } from './components/MomsStory';
import { SellerDashboard } from './components/SellerDashboard';
import { MyOrdersModal } from './components/MyOrdersModal';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { Footer } from './components/Footer';

import { CHOCOLATES } from './data/chocolatesData';
import { INITIAL_REVIEWS } from './data/initialReviews';
import { Chocolate, BoxOption, CartItem, Order, CustomerReview, OrderStatus } from './types';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';
import { SELLER_EMAIL, SELLER_PHONE } from './services/gmailService';
import { User } from 'firebase/auth';
import { Sparkles, ShieldCheck, Heart, Coffee, CheckCircle2, Phone, Mail } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Products and Inventory State
  const [chocolates, setChocolates] = useState<Chocolate[]>(CHOCOLATES);
  
  // Reviews reset to clean baseline (starts empty as requested)
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('adrit_reviews_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Reviews storage read note:', e);
    }
    return INITIAL_REVIEWS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('adrit_reviews_v3', JSON.stringify(reviews));
    } catch (e) {
      console.warn('Reviews storage write note:', e);
    }
  }, [reviews]);

  // Orders State with localStorage persistence (starts clean, persists newly placed orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('adrit_orders_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Orders storage read note:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('adrit_orders_v2', JSON.stringify(orders));
    } catch (e) {
      console.warn('Orders storage write note:', e);
    }
  }, [orders]);

  // Synchronize orders across browser tabs/windows and backend updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adrit_orders_v2' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          setOrders(fresh);
        } catch (err) {
          console.warn('Orders storage sync error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals and Drawers
  const [selectedChocolateForDetail, setSelectedChocolateForDetail] = useState<Chocolate | null>(null);
  const [quickOrderData, setQuickOrderData] = useState<{
    chocolate: Chocolate;
    box: BoxOption;
  } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSellerPortalOpen, setIsSellerPortalOpen] = useState<boolean>(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Floating Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initialize Firebase Auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        showToast(`Connected as ${res.user.displayName || res.user.email}!`);
      }
    } catch (err: any) {
      console.warn('Sign-in note:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    showToast('Signed out from Google account.');
  };

  // Inventory Management: Update stock
  const handleUpdateStock = (chocolateId: string, newStock: number) => {
    setChocolates((prev) =>
      prev.map((c) =>
        c.id === chocolateId
          ? { ...c, stock: newStock, inStock: newStock > 0 }
          : c
      )
    );
    showToast(`Inventory updated (${newStock} boxes in stock)`);
  };

  // Cart Handlers
  const handleAddToCart = (chocolate: Chocolate, selectedBox: BoxOption) => {
    if (chocolate.stock <= 0) {
      showToast('Sorry, this chocolate is currently sold out.');
      return;
    }

    const itemKey = `${chocolate.id}-${selectedBox.label}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.id === itemKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          chocolate,
          selectedBox,
          quantity: 1,
        },
      ];
    });
    showToast(`Added ${chocolate.name} to cart!`);
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from cart.');
  };

  // Order Success & Inventory Decrement
  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Decrement inventory for each ordered chocolate item
    setChocolates((prev) => {
      const updated = [...prev];
      newOrder.items.forEach((item) => {
        const targetIndex = updated.findIndex((c) => c.id === item.chocolate.id);
        if (targetIndex !== -1) {
          const currentStock = updated[targetIndex].stock;
          const newStock = Math.max(0, currentStock - item.quantity);
          updated[targetIndex] = {
            ...updated[targetIndex],
            stock: newStock,
            inStock: newStock > 0,
          };
        }
      });
      return updated;
    });

    showToast(`🎉 Order #${newOrder.id} placed! Receipt sent to email.`);
  };

  // Order Management: update status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      try {
        localStorage.setItem('adrit_orders_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      window.dispatchEvent(
        new CustomEvent('adrit_order_status_changed', {
          detail: {
            orderId,
            newStatus,
            order: updated.find((o) => o.id === orderId),
          },
        })
      );
      return updated;
    });
    showToast(`Order #${orderId} marked as ${newStatus.toUpperCase()}`);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      try {
        localStorage.setItem('adrit_orders_v2', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage error:', e);
      }
      window.dispatchEvent(
        new CustomEvent('adrit_order_status_changed', {
          detail: {
            orderId: updatedOrder.id,
            newStatus: updatedOrder.status,
            order: updatedOrder,
          },
        })
      );
      return updated;
    });
  };

  const handleAddReview = (newReview: CustomerReview) => {
    setReviews((prev) => [newReview, ...prev]);
    showToast('✨ Thank you! Your review has been published.');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2c180e] font-sans selection:bg-[#d4a373] selection:text-[#1c100b]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-[#d8c3b0] text-[#2a160d] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#b45309] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar with My Orders and Owner-Only Mom's Portal */}
      <Navbar
        cart={cart}
        orders={orders}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={scrollToSection}
        onOpenSellerPortal={() => setIsSellerPortalOpen(true)}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        isAuthenticating={isAuthenticating}
        reviewsCount={reviews.length}
      />

      {/* Hero Banner */}
      <Hero
        onExploreCatalog={() => scrollToSection('catalog')}
        onOpenStory={() => scrollToSection('story')}
        onExploreFeatured={() => scrollToSection('featured')}
        onQuickCustomOrder={() => {
          const grandHamper = chocolates.find((c) => c.category === 'hampers') || chocolates[0];
          setQuickOrderData({ chocolate: grandHamper, box: grandHamper.boxOptions[1] || grandHamper.boxOptions[0] });
        }}
      />

      {/* Rotating Featured Chocolates Section */}
      <FeaturedChocolates
        chocolates={chocolates}
        onSelectChocolate={(c) => setSelectedChocolateForDetail(c)}
        onQuickOrder={(c, b) => setQuickOrderData({ chocolate: c, box: b })}
        onAddToCart={handleAddToCart}
      />

      {/* Full Product Catalog with Inventory badges */}
      <ProductCatalog
        chocolates={chocolates}
        onSelectChocolate={(c) => setSelectedChocolateForDetail(c)}
        onQuickOrder={(c, b) => setQuickOrderData({ chocolate: c, box: b })}
        onAddToCart={handleAddToCart}
      />

      {/* Pure Cocoa Guarantee Banner */}
      <section id="guarantee" className="py-14 bg-gradient-to-b from-white to-[#fff8f0] border-y border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Sunita's Quality Pledge
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2a160d] mt-2">
              Why Adrit Homemade Chocolates Taste Unmatched
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-3xl p-6 space-y-3 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-lg text-emerald-950">
                100% Real Cocoa Butter
              </h4>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                Industrial chocolates substitute cocoa butter with cheap hydrogenated palm oils. We exclusively temper pure cocoa butter so our chocolates melt naturally at body temperature (34°C).
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-6 space-y-3 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-lg text-amber-950">
                Direct Contact & Email Confirmation
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                No complicated online payment gateway. When you order, a receipt is sent to your email, and Sunita contacts you directly to confirm delivery and take payment (UPI or Cash).
              </p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-3xl p-6 space-y-3 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-lg text-rose-950">
                Mother's Fresh Kitchen Care
              </h4>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                Your order is confirmed directly with Sunita at {SELLER_PHONE}. Have special dietary needs or require wax-sealed handwritten greeting cards? She personally looks after each box.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Mom's Story */}
      <MomsStory />

      {/* Customer Reviews Section */}
      <ReviewsSection
        reviews={reviews}
        chocolates={chocolates}
        onAddReview={handleAddReview}
      />

      {/* Direct Contact Call to Action */}
      <section className="py-16 bg-gradient-to-r from-rose-100 via-amber-100 to-emerald-100 border-t border-rose-200 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-rose-900 text-xs font-bold shadow-xs border border-rose-200">
            <Coffee className="w-3.5 h-3.5 text-rose-600" />
            <span>Custom Festive Hampers & Corporate Bulk Gifting</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#2a160d]">
            Speak Directly with Sunita (Mom)
          </h2>
          <p className="text-xs sm:text-sm text-[#5c3722] max-w-xl mx-auto font-medium">
            From wedding hampers to birthday trays, Sunita crafts bespoke flavor assortments with personalized satin ribbons and wax seals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={`tel:${SELLER_PHONE.replace(/[^0-9+]/g, '')}`}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white text-xs sm:text-sm font-bold hover:opacity-95 shadow-lg shadow-rose-600/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Sunita ({SELLER_PHONE})</span>
            </a>
            <a
              href={`https://wa.me/${SELLER_PHONE.replace(/[^0-9]/g, '')}?text=Hello%20Sunita%20Aunty,%20I%20would%20like%20to%20inquire%20about%20Adrit%20Creations%20chocolates!`}
              target="_blank"
              rel="noreferrer"
              className="px-7 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>WhatsApp Inquiries</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenSellerPortal={() => setIsSellerPortalOpen(true)}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        currentUser={currentUser}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        chocolate={selectedChocolateForDetail}
        isOpen={Boolean(selectedChocolateForDetail)}
        onClose={() => setSelectedChocolateForDetail(null)}
        onQuickOrder={(choc, box) => {
          setSelectedChocolateForDetail(null);
          setQuickOrderData({ chocolate: choc, box });
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Quick Order Modal (Direct Buy & Email Sunita without payment gateway) */}
      {quickOrderData && (
        <QuickOrderModal
          chocolate={quickOrderData.chocolate}
          initialBox={quickOrderData.box}
          isOpen={Boolean(quickOrderData)}
          onClose={() => setQuickOrderData(null)}
          onOrderSuccess={handleOrderSuccess}
          currentUser={currentUser}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Multi-Item Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderSuccess={handleOrderSuccess}
        onClearCart={() => setCart([])}
        currentUser={currentUser}
      />

      {/* Customer 'My Orders' Section & User Profile Modal */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        orders={orders}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

      {/* Seller Portal: Order Management System & Inventory (STRICTLY OWNER ONLY) */}
      <SellerDashboard
        isOpen={isSellerPortalOpen}
        onClose={() => setIsSellerPortalOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateOrder={handleUpdateOrder}
        chocolates={chocolates}
        onUpdateStock={handleUpdateStock}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenMyOrders={() => {
          setIsSellerPortalOpen(false);
          setIsMyOrdersOpen(true);
        }}
      />

      {/* Firebase Authentication Modal (Email/Password, Register, Reset & Google) */}
      <FirebaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Signed in as ${user.displayName || user.email}!`);
        }}
        onOpenMyOrders={() => {
          setIsAuthModalOpen(false);
          setIsMyOrdersOpen(true);
        }}
        onOpenSellerPortal={() => {
          setIsAuthModalOpen(false);
          setIsSellerPortalOpen(true);
        }}
      />

    </div>
  );
}
