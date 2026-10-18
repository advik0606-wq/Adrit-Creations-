import React, { useState } from 'react';
import { 
  X, Sparkles, CheckCircle2, Phone, Mail, MapPin, Calendar, Clock, 
  Gift, ArrowRight, MessageSquare, Send, ExternalLink, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Chocolate, BoxOption, CustomerDetails, Order } from '../types';
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

interface QuickOrderModalProps {
  chocolate: Chocolate;
  initialBox: BoxOption;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  currentUser: User | null;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  chocolate,
  initialBox,
  isOpen,
  onClose,
  onOrderSuccess,
  currentUser,
}) => {
  const [selectedBox, setSelectedBox] = useState<BoxOption>(initialBox);
  const [quantity, setQuantity] = useState<number>(1);
  const [ribbonColor, setRibbonColor] = useState<string>('Classic Gold Satin');
  const [giftNote, setGiftNote] = useState<string>('');

  // Form State
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

  if (!isOpen) return null;

  const subtotal = selectedBox.price * quantity;
  const deliveryFee = subtotal >= 1000 ? 0 : 60;
  const grandTotal = subtotal + deliveryFee;

  const ribbonOptions = [
    'Classic Gold Satin',
    'Royal Crimson Velvet',
    'Blush Rose Silk',
    'Forest Green Festive',
    'Rich Chocolate Grosgrain',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Please enter your full name';
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter your mobile phone number';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please provide your email address to receive your confirmation receipt';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.address.trim()) errors.address = 'Please enter your delivery street address';
    if (!formData.city.trim()) errors.city = 'Please enter your city';
    if (!formData.pincode.trim() || formData.pincode.replace(/[^0-9]/g, '').length < 6) {
      errors.pincode = 'Please enter a valid 6-digit pin code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateOrderId = () => {
    return `ADRIT-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (chocolate.stock <= 0) {
      alert('This chocolate is currently sold out in our kitchen.');
      return;
    }

    setIsSubmitting(true);

    const orderId = generateOrderId();
    const orderObj: Order = {
      id: orderId,
      items: [
        {
          id: `${chocolate.id}-${selectedBox.label}-${Date.now()}`,
          chocolate,
          selectedBox,
          quantity,
          customGiftNote: giftNote.trim() || undefined,
          ribbonColor,
        },
      ],
      customer: formData,
      subtotal,
      deliveryFee,
      total: grandTotal,
      status: 'new',
      createdAt: new Date().toISOString(),
      gmailSent: false,
      buyerGmailSent: false,
    };

    // Check if we have an active access token
    let token = await getAccessToken();

    // If not authenticated yet, attempt quick sign-in to get the token
    if (!token && !currentUser) {
      try {
        const authRes = await googleSignIn();
        if (authRes?.accessToken) {
          token = authRes.accessToken;
        }
      } catch (err: any) {
        console.warn('Google sign-in optional step dismissed:', err);
      }
    }

    // If token is available, dispatch dual emails immediately!
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
      } catch (err: any) {
        console.warn('Gmail API dispatch attempt:', err);
      }
    }

    try {
      confetti({
        particleCount: 95,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#8b5cf6', '#d97706'],
      });
    } catch {
      // ignore
    }

    onOrderSuccess(orderObj);
    setCompletedOrder(orderObj);
    setIsSubmitting(false);
  };

  // One-click helper to authenticate and dispatch emails via Google if not sent yet
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
        
        {/* Colorful Gradient Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#fbcfe8] bg-gradient-to-r from-[#fff1f2] via-[#fef3c7] to-[#ecfdf5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#e11d48] to-[#ea580c] flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2a160d]">
                {completedOrder ? 'Order Confirmed!' : `Direct Order: ${chocolate.name}`}
              </h3>
              <p className="text-xs text-[#be123c] font-semibold">
                {completedOrder
                  ? `Order #${completedOrder.id}`
                  : 'Handcrafted fresh on order &bull; Confirmation sent to Gmail'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-100 text-[#831843] hover:text-[#9f1239] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
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
                  <span>Order Placed Successfully</span>
                </span>
                <h4 className="text-2xl font-serif font-bold text-[#2a160d] mt-2">
                  Thank You, {completedOrder.customer.name}!
                </h4>
                <p className="text-xs sm:text-sm text-[#5a3825] mt-1.5 max-w-md mx-auto leading-relaxed">
                  Your order ID is <strong className="text-[#be123c] font-bold">#{completedOrder.id}</strong>.
                  Sunita will contact you directly on{' '}
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

              {/* Order Info Card */}
              <div className="bg-[#faf5ee] border border-[#f3d9bd] rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#ebd9c8]">
                  <span className="text-[#7c5c47] font-medium">Order Status:</span>
                  <span className="bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0] px-3 py-1 rounded-full font-bold">
                    Order Received &bull; Payment on Contact
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-[#523321]">
                  <p>
                    <strong>Items:</strong> {chocolate.name} ({selectedBox.label}) x {quantity} box(es)
                  </p>
                  <p>
                    <strong>Delivery Address:</strong> {completedOrder.customer.address}, {completedOrder.customer.city} - {completedOrder.customer.pincode}
                  </p>
                  <p>
                    <strong>Delivery Slot:</strong> {completedOrder.customer.deliveryDate} ({completedOrder.customer.timeSlot})
                  </p>
                  <p>
                    <strong>Total to Pay on Contact:</strong>{' '}
                    <span className="font-bold text-[#be123c] text-sm">₹{completedOrder.total}</span> (Sunita will collect via UPI / Cash)
                  </p>
                </div>
              </div>

              {/* Direct Seller Contact Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
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
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#ea580c] text-white text-xs font-bold hover:opacity-95 transition-all shadow-md cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>

            </div>
          ) : (
            /* Order Input Form */
            <form onSubmit={handleConfirmOrder} className="space-y-6">
              
              {/* Product Preview Card */}
              <div className="flex gap-4 p-4 bg-gradient-to-r from-[#fff1f2] to-[#fffbeb] rounded-2xl border border-rose-100 shadow-xs">
                <img
                  src={chocolate.image}
                  alt={chocolate.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm border border-rose-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Pure Belgian Couverture
                  </span>
                  <h4 className="font-serif font-bold text-base sm:text-lg text-[#2a160d] mt-1 truncate">
                    {chocolate.name}
                  </h4>
                  <p className="text-xs text-[#7c5c47] line-clamp-1">{chocolate.tagline}</p>
                  <div className="mt-2 text-xs font-bold text-amber-900">
                    <span>Base: ₹{selectedBox.price} per box</span>
                  </div>
                </div>
              </div>

              {/* Box Size Selection */}
              <div>
                <label className="block text-xs font-bold text-[#4a2e1b] uppercase tracking-wider mb-2">
                  Select Box Size:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {chocolate.boxOptions.map((box) => (
                    <button
                      key={box.label}
                      type="button"
                      onClick={() => setSelectedBox(box)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedBox.label === box.label
                          ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-200 text-rose-950 shadow-xs'
                          : 'bg-white border-rose-100 hover:border-rose-300 text-[#4a2e1b]'
                      }`}
                    >
                      <div className="text-xs font-bold">{box.label}</div>
                      <div className="text-[11px] text-[#7c5c47]">{box.count}</div>
                      <div className="text-xs font-bold text-rose-600 mt-1">₹{box.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
                <span className="text-xs font-bold text-[#4a2e1b]">Quantity of Boxes:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl bg-white border border-rose-200 text-rose-800 font-bold flex items-center justify-center hover:bg-rose-100 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-[#2a160d] w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-xl bg-white border border-rose-200 text-rose-800 font-bold flex items-center justify-center hover:bg-rose-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Gift Ribbon & Custom Greeting Note */}
              <div className="space-y-3 bg-[#faf5ee] p-4 rounded-2xl border border-[#ebd9c8]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#78350f]">
                  <Gift className="w-4 h-4 text-rose-600" />
                  <span>Artisanal Packaging & Gift Ribbon (Complimentary)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#7c5c47] mb-1 font-semibold">
                      Satin Ribbon Color:
                    </label>
                    <select
                      value={ribbonColor}
                      onChange={(e) => setRibbonColor(e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    >
                      {ribbonOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#7c5c47] mb-1 font-semibold">
                      Handwritten Note on Card:
                    </label>
                    <input
                      type="text"
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="e.g., Happy Birthday Mom! Love Priya"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] placeholder-[#a8826c] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Contact & Delivery Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                  <h4 className="font-serif font-bold text-sm text-[#2a160d] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Customer & Delivery Details</span>
                  </h4>
                  <span className="text-[11px] text-[#8c6550]">
                    *Sunita will contact this phone to confirm
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                    {formErrors.name && (
                      <span className="text-[10px] text-red-600 mt-0.5 block">{formErrors.name}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Phone Number (Call/WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
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
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. New Delhi"
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                    Street Address & Flat / House No. *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House No, Apartment, Street, Locality"
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
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
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
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4a2e1b] mb-1">
                      Time Slot *
                    </label>
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleInputChange}
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
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="e.g., Ring doorbell twice, keep cold, gift packaging"
                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-[#2a160d] focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Order Total & Direct Payment Info */}
              <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-white p-4 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex justify-between text-xs text-[#6b4733]">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-[#6b4733]">
                  <span>Delivery (Free above ₹1000):</span>
                  <span className="font-semibold">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-serif font-bold text-rose-950 pt-2 border-t border-rose-200">
                  <span>Total to Pay:</span>
                  <span className="text-rose-600 text-lg">₹{grandTotal}</span>
                </div>
                <p className="text-[11px] text-[#7c5c47] pt-1">
                  💡 No online gateway. When you click confirm, an order notification is emailed to Sunita ({SELLER_EMAIL}) and receipt to you. Sunita will call or WhatsApp you to confirm preparation and take payment (UPI / Cash).
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
                      ? 'Confirming & Sending to Sunita...'
                      : `Confirm Order (₹${grandTotal}) & Email Sunita`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Modal Footer */}
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
