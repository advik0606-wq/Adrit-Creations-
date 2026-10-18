import React, { useState } from 'react';
import { 
  X, Sparkles, CheckCircle2, Phone, Mail, MapPin, Calendar, Clock, 
  ArrowRight, MessageSquare, Send, ExternalLink, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerDetails, Order } from '../types';
import { 
  SELLER_EMAIL, 
  SELLER_PHONE, 
  sendDualOrderEmails, 
  generateGmailWebUrl,
  generateMailtoUrl, 
  generateWhatsAppUrl 
} from '../services/gmailService';
import { getAccessToken, googleSignIn } from '../services/firebaseAuth';
import { User } from 'firebase/auth';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
  currentUser: User | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onOrderSuccess,
  onClearCart,
  currentUser,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.selectedBox.price * item.quantity, 0);
  const deliveryFee = subtotal >= 1000 ? 0 : 60;
  const grandTotal = subtotal + deliveryFee;

  const [formData, setFormData] = useState<CustomerDetails>({
    name: currentUser?.displayName || '',
    phone: '',
    email: currentUser?.email || '',
    address: '',
    landmark: '',
    city: 'New Delhi',
    pincode: '',
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: 'Morning (10:00 AM - 1:00 PM)',
    paymentPreference: 'Sunita will contact via Phone/WhatsApp to take payment',
    specialInstructions: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSendingGoogleEmail, setIsSendingGoogleEmail] = useState<boolean>(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Please provide your full name';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required so Sunita can reach you';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      errs.phone = 'Please provide a valid 10-digit number';
    }
    if (!formData.email.trim()) {
      errs.email = 'Please provide your email to receive your official order confirmation';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) errs.address = 'Please provide your street address';
    if (!formData.city.trim()) errs.city = 'Please enter your city';
    if (!formData.pincode.trim() || formData.pincode.replace(/[^0-9]/g, '').length < 6) {
      errs.pincode = 'Please enter valid 6-digit pin code';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const orderObj: Order = {
      id: `ADRIT-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cart],
      customer: formData,
      subtotal,
      deliveryFee,
      total: grandTotal,
      status: 'new',
      createdAt: new Date().toISOString(),
      gmailSent: false,
      buyerGmailSent: false,
    };

    // Attempt token retrieval
    let token = await getAccessToken();

    // If not signed in yet, offer quick sign-in to dispatch emails
    if (!token && !currentUser) {
      try {
        const authRes = await googleSignIn();
        if (authRes?.accessToken) {
          token = authRes.accessToken;
        }
      } catch (err: any) {
        console.warn('Optional sign-in skipped:', err);
      }
    }

    if (token) {
      try {
        const dualRes = await sendDualOrderEmails(orderObj, token, currentUser?.email || undefined);
        if (dualRes.sellerSuccess) {
          orderObj.gmailSent = true;
          orderObj.gmailMessageId = dualRes.sellerMessageId;
        }
        if (dualRes.buyerSuccess) {
          orderObj.buyerGmailSent = true;
          orderObj.buyerGmailMessageId = dualRes.buyerMessageId;
        }
      } catch (e) {
        console.warn('Gmail API dispatch error:', e);
      }
    }

    try {
      confetti({
        particleCount: 100,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#8b5cf6', '#d97706'],
      });
    } catch {
      // ignore
    }

    onOrderSuccess(orderObj);
    onClearCart();
    setCompletedOrder(orderObj);
    setIsSubmitting(false);
  };

  const handleDispatchGoogleEmails = async () => {
    if (!completedOrder) return;
    setIsSendingGoogleEmail(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (token) {
        const dualRes = await sendDualOrderEmails(completedOrder, token, currentUser?.email || undefined);
        const updatedOrder: Order = {
          ...completedOrder,
          gmailSent: dualRes.sellerSuccess || completedOrder.gmailSent,
          buyerGmailSent: dualRes.buyerSuccess || completedOrder.buyerGmailSent,
          gmailMessageId: dualRes.sellerMessageId || completedOrder.gmailMessageId,
          buyerGmailMessageId: dualRes.buyerMessageId || completedOrder.buyerGmailMessageId,
        };
        setCompletedOrder(updatedOrder);
        onOrderSuccess(updatedOrder);
      }
    } catch (err: any) {
      console.warn('Dispatch via Google error:', err);
    } finally {
      setIsSendingGoogleEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-[#fbcfe8] rounded-3xl shadow-2xl overflow-hidden text-[#2c180e] my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#fbcfe8] bg-gradient-to-r from-[#fff1f2] via-[#fef3c7] to-[#ecfdf5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e11d48] to-[#ea580c] flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2a160d]">
                {completedOrder ? 'Order Confirmed!' : 'Review & Confirm Order'}
              </h3>
              <p className="text-xs text-[#be123c] font-semibold">
                {completedOrder ? `Order #${completedOrder.id}` : 'Handcrafted fresh on order &bull; Confirmation sent to Gmail'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-100 text-[#831843] hover:text-[#9f1239] transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-gradient-to-b from-[#fffbf7] to-white">
          
          {completedOrder ? (
            /* Success State */
            <div className="text-center py-4 space-y-6">
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#10b981] to-[#34d399] text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef2f2] text-[#be123c] text-xs font-bold uppercase tracking-wider border border-[#fecdd3]">
                  <Sparkles className="w-3.5 h-3.5 text-[#e11d48]" />
                  <span>Order Successfully Placed</span>
                </span>
                <h4 className="text-2xl font-serif font-bold text-[#2a160d] mt-2">
                  Thank You, {completedOrder.customer.name}!
                </h4>
                <p className="text-xs sm:text-sm text-[#5a3825] mt-1.5 max-w-md mx-auto leading-relaxed">
                  Your order ID is <strong className="text-[#be123c] font-bold">#{completedOrder.id}</strong>.
                  Sunita has received your order details and will contact you directly on{' '}
                  <strong className="text-[#2a160d]">{completedOrder.customer.phone}</strong> to confirm the batch and take your payment (UPI / Cash)!
                </p>
              </div>

              {/* Automatic Email Delivery Status Cards */}
              <div className="space-y-3">
                
                {/* 1. Seller Email Status */}
                <div className="bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border border-[#a7f3d0] p-3.5 rounded-2xl text-left flex items-center gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <strong className="text-[#065f46] text-sm block">
                      Order Automatically Sent to Sunita's Gmail!
                    </strong>
                    <span className="text-[#047857]">
                      Full order and customer details have been successfully delivered to <strong>{SELLER_EMAIL}</strong>.
                    </span>
                  </div>
                </div>

                {/* 2. Buyer Confirmation Email Status */}
                <div className="bg-gradient-to-r from-[#f0fdf4] to-[#ecfdf5] border border-[#a7f3d0] p-3 rounded-2xl text-left flex items-center gap-3 text-xs text-[#065f46]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Official order confirmation email sent to buyer inbox: <strong>{completedOrder.customer.email}</strong>.
                  </span>
                </div>

              </div>

              {/* Order Summary Box */}
              <div className="bg-[#faf5ee] border border-[#f3d9bd] rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#ebd9c8]">
                  <span className="text-[#7c5c47] font-medium">Order ID: #{completedOrder.id}</span>
                  <span className="text-[#be123c] font-bold text-sm">Total to Pay on Contact: ₹{completedOrder.total}</span>
                </div>

                <div className="space-y-1 text-xs text-[#523321]">
                  <p><strong>Deliver to:</strong> {completedOrder.customer.address}, {completedOrder.customer.city} - {completedOrder.customer.pincode}</p>
                  <p><strong>Scheduled Slot:</strong> {completedOrder.customer.deliveryDate} ({completedOrder.customer.timeSlot})</p>
                  <p><strong>Payment Collection:</strong> Sunita will contact via Phone/WhatsApp to take payment (UPI / Cash)</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${SELLER_PHONE.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-xs font-bold text-[#9f1239] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#e11d48]" />
                  <span>Call Sunita ({SELLER_PHONE})</span>
                </a>
                <a
                  href={generateWhatsAppUrl(completedOrder, '919971921200')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Sunita</span>
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e11d48] via-[#ea580c] to-[#b45309] text-white text-xs font-bold hover:opacity-95 shadow-md transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleConfirmOrder} className="space-y-6">
              
              {/* Items summary */}
              <div className="bg-gradient-to-r from-[#fff1f2] to-[#fffbeb] border border-rose-100 rounded-2xl p-4 space-y-2 shadow-xs">
                <div className="flex justify-between items-center text-xs font-bold text-[#9f1239] pb-1 border-b border-rose-200">
                  <span>Items in Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 divide-y divide-rose-100/60 pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-1.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-[#3b2012]">{item.chocolate.name}</span>
                        <span className="text-[11px] text-[#7c5c47] block">
                          {item.selectedBox.label} x {item.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-amber-900">
                        ₹{item.selectedBox.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details Form */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-sm text-[#2a160d] border-b border-rose-100 pb-1">
                  Delivery & Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                    {formErrors.name && (
                      <span className="text-[10px] text-red-600 mt-0.5 block">{formErrors.name}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Phone Number (Call / WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                    {formErrors.phone && (
                      <span className="text-[10px] text-red-600 mt-0.5 block">{formErrors.phone}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Email Address (For Confirmation Receipt) *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. priya@gmail.com"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                    {formErrors.email && (
                      <span className="text-[10px] text-red-600 mt-0.5 block">{formErrors.email}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Delivery City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. New Delhi"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                    Complete Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House No., Building, Street Name, Landmark"
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                  />
                  {formErrors.address && (
                    <span className="text-[10px] text-red-600 mt-0.5 block">{formErrors.address}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Pin Code *
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 110001"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                    {formErrors.pincode && (
                      <span className="text-[10px] text-red-600 mt-0.5 block">{formErrors.pincode}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Time Slot *
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    >
                      <option value="Morning (10:00 AM - 1:00 PM)">Morning (10am - 1pm)</option>
                      <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1pm - 5pm)</option>
                      <option value="Evening (5:00 PM - 8:30 PM)">Evening (5pm - 8:30pm)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                    Special Packaging or Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    placeholder="e.g., Keep in shaded cold area, call before arrival"
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-white p-4 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex justify-between text-xs text-[#6b4733]">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-[#6b4733]">
                  <span>Delivery (Free above ₹1000):</span>
                  <span className="font-semibold">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-serif font-bold text-rose-950 pt-2 border-t border-rose-200">
                  <span>Total Amount to Pay:</span>
                  <span className="text-rose-600 text-lg">₹{grandTotal}</span>
                </div>
                <p className="text-[11px] text-[#7c5c47] pt-1">
                  💡 Order confirmation email will be sent to your Gmail & to Sunita ({SELLER_EMAIL}). She will call you to confirm preparation and take payment (UPI / Cash).
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#e11d48] via-[#ea580c] to-[#e11d48] text-white font-bold text-sm shadow-xl shadow-rose-600/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Confirming & Emailing Sunita...'
                      : `Confirm Order (₹${grandTotal}) & Email Sunita`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rose-100 bg-[#fffbf7] flex items-center justify-between text-xs text-[#7c5c47]">
          <span>Direct Kitchen: <strong>{SELLER_PHONE}</strong></span>
          <button
            onClick={onClose}
            className="text-rose-800 font-bold hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
