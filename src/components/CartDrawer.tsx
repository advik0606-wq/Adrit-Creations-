import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Sparkles, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.selectedBox.price * item.quantity, 0);
  const deliveryFee = subtotal >= 1000 || subtotal === 0 ? 0 : 60;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white border-l-2 border-rose-200 text-[#2c180e] h-full flex flex-col shadow-2xl animate-slideLeft">
        
        {/* Drawer Header with Colorful Gradient */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-amber-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2a160d]">
                Your Chocolate Cart
              </h3>
              <p className="text-[11px] text-rose-800 font-semibold">
                {cart.length} item{cart.length === 1 ? '' : 's'} &bull; Fresh from kitchen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-rose-100 text-rose-800 hover:text-rose-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 px-5 py-2.5 border-b border-amber-200 text-xs">
          {subtotal >= 1000 ? (
            <p className="text-emerald-800 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>You have unlocked FREE Doorstep Delivery!</span>
            </p>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-amber-900 font-bold">
                <span>Add ₹{1000 - subtotal} more for Free Delivery</span>
                <span>₹{subtotal} / ₹1000</span>
              </div>
              <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden border border-amber-200">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (subtotal / 1000) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#fffbf7] to-white">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#2a160d]">
                Your cart is empty
              </h4>
              <p className="text-xs text-[#7c5c47] max-w-xs mx-auto">
                Explore our homemade truffles, roasted almond clusters, and royal saffron pralines!
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                Browse Chocolates
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-rose-100 rounded-2xl p-3.5 flex gap-3.5 shadow-xs hover:border-rose-300 transition-colors"
              >
                <img
                  src={item.chocolate.image}
                  alt={item.chocolate.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-rose-200"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-serif font-bold text-xs truncate text-[#2a160d]">
                        {item.chocolate.name}
                      </h4>
                      <p className="text-[11px] text-rose-800 font-semibold">
                        {item.selectedBox.label} ({item.selectedBox.count})
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-50">
                    <span className="text-xs font-bold text-[#be123c]">
                      ₹{item.selectedBox.price * item.quantity}
                    </span>

                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-2 py-0.5 text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="text-rose-700 hover:text-rose-950 font-bold cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-[#2a160d] w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-rose-700 hover:text-rose-950 font-bold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-rose-100 bg-white space-y-4">
            <div className="space-y-1.5 text-xs text-[#7c5c47]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-[#2a160d] font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Packaging & Delivery:</span>
                <span>
                  {deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#2a160d] pt-2 border-t border-rose-100">
                <span>Total to Pay on Contact:</span>
                <span className="text-rose-700 text-base font-serif">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
