import React, { useState } from 'react';
import { 
  X, Package, Sparkles, Clock, ChefHat, Truck, CheckCircle2, 
  Phone, MessageSquare, ArrowRight, Search, ShieldCheck, Mail, 
  User as UserIcon, Calendar, MapPin, Heart, AlertCircle, RefreshCw
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { SELLER_PHONE, SELLER_EMAIL, generateWhatsAppUrl } from '../services/gmailService';
import { User } from 'firebase/auth';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onLogout?: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentUser,
  onGoogleSignIn,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [lookupQuery, setLookupQuery] = useState<string>('');

  // Role & Ownership Filter:
  // For customers, show ONLY their own orders!
  const userEmail = currentUser?.email?.toLowerCase().trim() || '';

  const userOrders = orders.filter((order) => {
    // If searching by Order ID or phone number
    if (lookupQuery.trim()) {
      const q = lookupQuery.toLowerCase().trim();
      const matchId = order.id.toLowerCase().includes(q);
      const matchPhone = order.customer.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      const matchEmail = order.customer.email.toLowerCase().includes(q);
      return matchId || matchPhone || matchEmail;
    }

    // Default: Match strictly by logged-in user's email
    if (userEmail) {
      return order.customer.email.toLowerCase().trim() === userEmail;
    }

    return false;
  });

  // Calculate statistics for the logged in user
  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = userOrders.filter(
    (o) => o.status === 'new' || o.status === 'processed' || o.status === 'shipped'
  ).length;

  const getStepProgress = (status: OrderStatus): number => {
    switch (status) {
      case 'new':
        return 1;
      case 'processed':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Order Confirmed &bull; Preparing</span>
          </span>
        );
      case 'processed':
        return (
          <span className="bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <ChefHat className="w-3.5 h-3.5 text-purple-600" />
            <span>In Kitchen &bull; Handcrafting</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Out for Delivery / Dispatched</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered Fresh</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1 rounded-full text-xs font-bold">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border-2 border-rose-200 rounded-3xl shadow-2xl overflow-hidden text-[#2c180e] my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50 via-amber-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 via-amber-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-600/20 shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2a160d]">
                  My Chocolate Orders
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                  Customer Portal
                </span>
              </div>
              <p className="text-xs text-rose-800 font-semibold mt-0.5">
                {currentUser
                  ? `Logged in as ${currentUser.email}`
                  : 'Track your handcrafted chocolate orders & kitchen status'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-100 text-rose-800 hover:text-rose-950 transition-colors cursor-pointer"
            aria-label="Close My Orders"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-gradient-to-b from-[#fffbf7] to-white">
          
          {/* User Profile Card (When Logged In) */}
          {currentUser ? (
            <div className="bg-gradient-to-r from-white via-rose-50/40 to-amber-50/40 border-2 border-rose-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User Profile'}
                      className="w-12 h-12 rounded-2xl border-2 border-rose-300 shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base text-[#2a160d]">
                        {currentUser.displayName || 'Valued Chocolate Lover'}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Account</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#7c5c47] flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-rose-600" />
                      <span>{currentUser.email}</span>
                    </p>
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-xs text-rose-700 hover:text-rose-900 border border-rose-200 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer self-end sm:self-center"
                  >
                    Sign Out
                  </button>
                )}
              </div>

              {/* Account Orders Quick Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-rose-100 text-center">
                <div className="bg-white/80 p-2.5 rounded-2xl border border-rose-100">
                  <span className="text-[10px] text-[#8c6550] uppercase font-bold tracking-wider block">Total Orders</span>
                  <span className="font-serif font-bold text-lg text-rose-950">{userOrders.length}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-2xl border border-rose-100">
                  <span className="text-[10px] text-[#8c6550] uppercase font-bold tracking-wider block">Active Batches</span>
                  <span className="font-serif font-bold text-lg text-amber-700">{activeOrdersCount}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-2xl border border-rose-100">
                  <span className="text-[10px] text-[#8c6550] uppercase font-bold tracking-wider block">Total Spent</span>
                  <span className="font-serif font-bold text-lg text-emerald-800">₹{totalSpent}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Unauthenticated Prompt */
            <div className="bg-gradient-to-r from-amber-50 to-rose-50 border-2 border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <strong className="text-amber-950 text-sm block font-bold">
                    Sign in to view your orders directly in your user profile
                  </strong>
                  <span className="text-[#6b4733] text-xs">
                    Sign in with your Google account to automatically link and view all your past chocolate orders and real-time statuses.
                  </span>
                </div>
              </div>
              <button
                onClick={onGoogleSignIn}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold hover:opacity-95 shadow-md shadow-rose-600/20 transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                Sign in with Google
              </button>
            </div>
          )}

          {/* Search / Lookup Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Search by Order ID (e.g. ADRIT-1234) or phone number..."
              className="w-full bg-white border border-rose-200 rounded-2xl pl-10 pr-20 py-2.5 text-xs text-[#2a160d] placeholder-[#8c6550] focus:outline-none focus:border-rose-500 shadow-xs"
            />
            {lookupQuery && (
              <button
                onClick={() => setLookupQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Orders Section */}
          {userOrders.length === 0 ? (
            <div className="text-center py-12 space-y-4 bg-white border border-rose-100 rounded-3xl p-8 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#2a160d]">
                  No Previous Orders Found
                </h4>
                <p className="text-xs text-[#7c5c47] max-w-md mx-auto mt-1 leading-relaxed">
                  {currentUser
                    ? `You haven't placed any chocolate orders with ${currentUser.email} yet. Once you place an order, its live kitchen preparation status and delivery timeline will show right here!`
                    : 'If you placed an order without signing in, type your Order ID (#ADRIT-XXXX) or phone number in the search bar above to track it.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:opacity-95 cursor-pointer transition-all"
              >
                Browse Chocolate Collection
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-[#7c5c47]">
                <span className="font-bold text-rose-950 uppercase tracking-wider text-[11px]">
                  Your Order History ({userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'})
                </span>
                <span>Only visible to your account</span>
              </div>

              {userOrders.map((order) => {
                const step = getStepProgress(order.status);
                const steps = [
                  { num: 1, label: 'Order Confirmed', desc: 'Received in Kitchen' },
                  { num: 2, label: 'In Kitchen', desc: 'Mom tempering couverture' },
                  { num: 3, label: 'Dispatched', desc: 'Cold insulated box' },
                  { num: 4, label: 'Delivered', desc: 'Doorstep arrival' },
                ];

                return (
                  <div
                    key={order.id}
                    className="bg-white border-2 border-rose-100 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Top Row: Order ID, Status Badge, and Date */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-lg sm:text-xl text-rose-950">
                            #{order.id}
                          </span>
                          <span className="text-xs text-[#8c6550]">
                            &bull; {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#7c5c47] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Deliver to: <strong className="text-[#2a160d]">{order.customer.address}, {order.customer.city} - {order.customer.pincode}</strong></span>
                        </p>
                      </div>

                      {getStatusBadge(order.status)}
                    </div>

                    {/* Visual Progress Timeline (Steps 1 to 4) */}
                    {order.status !== 'cancelled' && (
                      <div className="bg-gradient-to-r from-rose-50/60 via-amber-50/60 to-emerald-50/60 rounded-2xl p-4 border border-rose-100">
                        <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block mb-3">
                          Live Kitchen Tracking Status:
                        </span>
                        
                        <div className="grid grid-cols-4 gap-2 text-center relative">
                          {/* Progress Line */}
                          <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0">
                            <div 
                              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, ((step - 1) / 3) * 100))}%` }}
                            />
                          </div>

                          {steps.map((s) => {
                            const isCompleted = step >= s.num;
                            const isCurrent = step === s.num;

                            return (
                              <div key={s.num} className="flex flex-col items-center relative z-10">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all ${
                                    isCompleted
                                      ? 'bg-gradient-to-tr from-rose-600 to-amber-600 text-white ring-4 ring-rose-100'
                                      : 'bg-white text-gray-400 border border-gray-300'
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                                </div>
                                <span className={`text-[11px] font-bold mt-2 ${isCurrent ? 'text-rose-900' : 'text-[#6b4733]'}`}>
                                  {s.label}
                                </span>
                                <span className="text-[9px] text-[#8c6550] hidden sm:block">
                                  {s.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items Purchased in this order */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-[#4a2e1b] uppercase tracking-wider block">
                        Chocolates in this Order:
                      </span>
                      <div className="divide-y divide-rose-100 bg-rose-50/30 rounded-2xl border border-rose-100 overflow-hidden">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.chocolate.image}
                                alt={item.chocolate.name}
                                className="w-12 h-12 rounded-xl object-cover border border-rose-200 shrink-0 shadow-xs"
                              />
                              <div>
                                <h5 className="font-serif font-bold text-xs sm:text-sm text-[#2a160d]">
                                  {item.chocolate.name}
                                </h5>
                                <p className="text-[11px] text-[#7c5c47]">
                                  {item.selectedBox.label} ({item.selectedBox.count}) &bull; Qty: <strong className="text-rose-900">{item.quantity}</strong>
                                </p>
                                {item.ribbonColor && (
                                  <p className="text-[10px] text-amber-800 font-semibold">
                                    Ribbon: {item.ribbonColor}
                                  </p>
                                )}
                                {item.customGiftNote && (
                                  <p className="text-[10px] text-rose-700 italic bg-white/70 px-2 py-0.5 rounded border border-rose-200 mt-1">
                                    "{item.customGiftNote}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-serif font-bold text-sm text-rose-950">
                                ₹{item.selectedBox.price * item.quantity}
                              </span>
                              <p className="text-[10px] text-[#8c6550]">
                                ₹{item.selectedBox.price} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals & Delivery Schedule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-rose-100 text-xs">
                      <div className="space-y-1 text-[#6b4733]">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>Delivery Date: <strong className="text-[#2a160d]">{order.customer.deliveryDate}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-rose-600" />
                          <span>Slot: <strong className="text-[#2a160d]">{order.customer.timeSlot}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Contact: <strong className="text-[#2a160d]">{order.customer.phone}</strong></span>
                        </p>
                      </div>

                      <div className="sm:text-right space-y-1">
                        <div className="flex justify-between sm:justify-end gap-4 text-[#6b4733]">
                          <span>Subtotal:</span>
                          <span className="font-semibold">₹{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-4 text-[#6b4733]">
                          <span>Delivery Fee:</span>
                          <span className="font-semibold">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-4 text-sm font-serif font-bold text-rose-950 pt-1 border-t border-rose-100">
                          <span>Total Amount:</span>
                          <span className="text-base text-rose-600">₹{order.total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Sunita for this order action */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-rose-100">
                      <div className="text-[11px] text-[#7c5c47] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Payment will be taken upon Sunita contacting you (UPI / Cash).</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={generateWhatsAppUrl(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Sunita</span>
                        </a>
                        <a
                          href={`tel:${SELLER_PHONE.replace(/[^0-9+]/g, '')}`}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Kitchen</span>
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rose-100 bg-[#fffbf7] flex items-center justify-between text-xs text-[#7c5c47]">
          <span>Need custom changes to your order? Call Sunita at <strong>{SELLER_PHONE}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-900 font-bold hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
