import React, { useState } from 'react';
import { 
  X, Phone, MessageSquare, Mail, CheckCircle2, Truck, 
  ChefHat, UserCheck, Send, AlertCircle, 
  Sparkles, ExternalLink, Package, Search, Plus, Minus, Layers 
} from 'lucide-react';
import { Order, OrderStatus, Chocolate } from '../types';
import { SELLER_EMAIL, SELLER_PHONE, sendOrderViaGmail, sendDualOrderEmails, generateGmailWebUrl, buildOrderEmailHtml } from '../services/gmailService';
import { getAccessToken, googleSignIn } from '../services/firebaseAuth';
import { User } from 'firebase/auth';

interface SellerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  chocolates: Chocolate[];
  onUpdateStock: (chocolateId: string, newStock: number) => void;
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onOpenMyOrders?: () => void;
  onUpdateOrder?: (updatedOrder: Order) => void;
  onOpenAuthModal?: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  chocolates,
  onUpdateStock,
  currentUser,
  onGoogleSignIn,
  onOpenMyOrders,
  onUpdateOrder,
  onOpenAuthModal,
}) => {
  const isSeller = currentUser?.email?.toLowerCase().trim() === SELLER_EMAIL.toLowerCase().trim();

  if (!isOpen) return null;

  if (!isSeller) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
        <div className="relative w-full max-w-lg bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-md">
            <ChefHat className="w-8 h-8 text-amber-700" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Owner Access Only
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#2a160d] mt-2">
              Sunita's Kitchen Portal
            </h3>
            <p className="text-xs sm:text-sm text-[#6b4733] mt-2 leading-relaxed">
              This order management portal and kitchen inventory are strictly reserved for store owner (<strong>{SELLER_EMAIL}</strong>).
            </p>
            {currentUser && (
              <p className="text-xs text-rose-800 mt-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                You are currently signed in as: <strong>{currentUser.email}</strong>. You can view your placed orders in <strong>"My Orders"</strong>.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            {onOpenMyOrders && (
              <button
                onClick={onOpenMyOrders}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold shadow-md hover:opacity-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>View My Orders & Tracking</span>
              </button>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal();
                  else onGoogleSignIn();
                }}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 cursor-pointer"
              >
                Sign in with Firebase ({SELLER_EMAIL})
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-white border border-rose-200 text-xs font-bold text-rose-900 hover:bg-rose-50 cursor-pointer"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [emailStatusFeedback, setEmailStatusFeedback] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [previewEmailData, setPreviewEmailData] = useState<{ order: Order; isForSeller: boolean } | null>(null);

  // Live order calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const processedCount = orders.filter((o) => o.status === 'processed').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchName = o.customer.name.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      return matchId || matchName || matchPhone;
    }
    return true;
  });

  const handleSendDualEmailsViaGmail = async (order: Order) => {
    let token = await getAccessToken();
    if (!token) {
      try {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      } catch (err: any) {
        setEmailStatusFeedback('Please sign in with Google to authorize sending emails via Gmail.');
        return;
      }
    }

    if (!token) {
      setEmailStatusFeedback('Google authorization is required to send emails.');
      return;
    }

    setIsSendingEmail(true);
    setEmailStatusFeedback(`Dispatching order #${order.id} emails via Gmail API...`);

    try {
      const result = await sendDualOrderEmails(order, token, SELLER_EMAIL);
      let feedbackMsg = '';
      if (result.sellerSuccess) {
        order.gmailSent = true;
        order.gmailMessageId = result.sellerMessageId;
        feedbackMsg += `✅ Order notification sent to Sunita (${SELLER_EMAIL})! `;
      } else if (result.sellerError) {
        feedbackMsg += `⚠️ Seller email error: ${result.sellerError}. `;
      }

      if (result.buyerSuccess) {
        order.buyerGmailSent = true;
        order.buyerGmailMessageId = result.buyerMessageId;
        feedbackMsg += `✅ Official receipt sent to buyer (${order.customer.email})!`;
      } else if (result.buyerError) {
        feedbackMsg += `⚠️ Buyer email error: ${result.buyerError}.`;
      }

      setEmailStatusFeedback(feedbackMsg || 'Emails processed.');
    } catch (err: any) {
      setEmailStatusFeedback(`❌ Error sending emails: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleToggleMoneyReceived = async (order: Order) => {
    const nextMoneyReceived = !order.moneyReceived;
    const updatedOrder: Order = {
      ...order,
      moneyReceived: nextMoneyReceived,
      moneyReceivedAt: nextMoneyReceived ? new Date().toISOString() : undefined,
    };

    if (nextMoneyReceived && order.customer.email) {
      let token = await getAccessToken();
      if (!token) {
        try {
          const res = await googleSignIn();
          token = res?.accessToken || null;
        } catch (err: any) {
          console.warn('Google sign-in optional:', err);
        }
      }

      if (token) {
        try {
          const buyerRes = await sendOrderViaGmail(updatedOrder, token, order.customer.email, false, SELLER_EMAIL);
          if (buyerRes.success) {
            updatedOrder.buyerGmailSent = true;
            updatedOrder.buyerGmailMessageId = buyerRes.messageId;
            setEmailStatusFeedback(`💰 Money received for #${order.id}! Payment confirmation receipt automatically sent to buyer (${order.customer.email}).`);
          } else {
            setEmailStatusFeedback(`💰 Money received for #${order.id}, but email note: ${buyerRes.error}`);
          }
        } catch (err: any) {
          setEmailStatusFeedback(`💰 Money received for #${order.id}, but email error: ${err.message}`);
        }
      } else {
        setEmailStatusFeedback(`💰 Money received marked for #${order.id}. (Connect Gmail to auto-send confirmation email to buyer).`);
      }
    } else {
      setEmailStatusFeedback(`Money received status updated for #${order.id}.`);
    }

    if (onUpdateOrder) {
      onUpdateOrder(updatedOrder);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-0.5 rounded-full text-[11px] font-bold">New Order</span>;
      case 'processed':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-0.5 rounded-full text-[11px] font-bold">Processed & In Kitchen</span>;
      case 'shipped':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-0.5 rounded-full text-[11px] font-bold">Shipped / Dispatched</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 rounded-full text-[11px] font-bold">Delivered</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 px-3 py-0.5 rounded-full text-[11px] font-bold">Cancelled</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white border-2 border-rose-200 rounded-3xl shadow-2xl overflow-hidden text-[#2c180e] my-6 max-h-[94vh] flex flex-col">
        
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-rose-200 bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 via-amber-600 to-rose-700 p-0.5 shadow-md shadow-rose-600/20">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-rose-700">
                <ChefHat className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2a160d]">
                  Sunita’s Orders & Kitchen Portal
                </h3>
                <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Adrit Creations
                </span>
              </div>
              <p className="text-xs text-[#7c5c47] font-medium">
                Phone: <strong className="text-rose-900">{SELLER_PHONE}</strong> &bull; Registered Gmail: <strong className="text-rose-900">{SELLER_EMAIL}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-white border border-rose-200 px-3.5 py-1.5 rounded-full text-xs text-[#523321] shadow-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Signed in:</span>
                <span className="text-[#2a160d] font-bold">{currentUser.email}</span>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="px-4 py-2 rounded-full bg-white text-rose-900 text-xs font-bold hover:bg-rose-50 border border-rose-300 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span>Connect Gmail ({SELLER_EMAIL})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-rose-100 text-[#7c5c47] hover:text-rose-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Message Bar */}
        {emailStatusFeedback && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{emailStatusFeedback}</span>
            </div>
            <button
              onClick={() => setEmailStatusFeedback(null)}
              className="text-amber-700 hover:underline text-xs cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Colorful Metrics (Starting from 0!) */}
        <div className="p-5 sm:p-6 bg-[#fffbf7] border-b border-rose-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] text-rose-800 font-bold uppercase tracking-wider block">Total To Collect</span>
            <span className="text-2xl font-serif font-bold text-rose-600">₹{totalRevenue}</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider block">New Orders</span>
            <span className="text-2xl font-serif font-bold text-amber-600">{newOrdersCount}</span>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] text-purple-800 font-bold uppercase tracking-wider block">In Kitchen Crafting</span>
            <span className="text-2xl font-serif font-bold text-purple-600">{processedCount}</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">Shipped / Delivered</span>
            <span className="text-2xl font-serif font-bold text-emerald-600">{shippedCount + deliveredCount}</span>
          </div>
        </div>

        {/* Tabs: Orders Management vs Inventory Levels */}
        <div className="px-6 py-3 border-b border-rose-100 flex items-center justify-between gap-4 flex-wrap bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Customer Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kitchen Inventory Tracking</span>
            </button>
          </div>

          {activeTab === 'orders' && (
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-rose-200 text-xs text-[#2a160d] rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500 shadow-xs"
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="new">New ({newOrdersCount})</option>
                <option value="processed">Processed ({processedCount})</option>
                <option value="shipped">Shipped ({shippedCount})</option>
                <option value="delivered">Delivered ({deliveredCount})</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-gradient-to-b from-[#fffdfa] to-white">
            {orders.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-rose-100 p-8">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-lg text-[#2a160d]">
                  No Orders in Queue (Baseline at ₹0)
                </h4>
                <p className="text-xs text-[#7c5c47] max-w-sm mx-auto">
                  When a customer orders, their contact details, address, and chocolate choices will appear here instantly with Call and WhatsApp buttons, and automatic confirmation emails are dispatched!
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-[#7c5c47] text-xs">
                No orders match your selected status filter.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
                const whatsappMsg = encodeURIComponent(
                  `Namaste ${order.customer.name}! This is Sunita from Adrit Creations. I received your order #${order.id} for homemade chocolates (₹${order.total}). When would you like delivery and should I share my UPI QR for payment?`
                );

                return (
                  <div
                    key={order.id}
                    className="bg-white border-2 border-rose-100 rounded-3xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all hover:border-rose-300"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-lg text-rose-950">
                          #{order.id}
                        </span>
                        {getStatusBadge(order.status)}
                        <span className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-0.5 rounded-full text-[11px] font-bold">
                          Total: ₹{order.total} (To Collect)
                        </span>
                        <span className="text-xs text-[#8c6550]">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Money Received Toggle Button & State Transition Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleMoneyReceived(order)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            order.moneyReceived
                              ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                          }`}
                          title="Click to toggle money received and automatically send confirmation email to buyer"
                        >
                          <span>{order.moneyReceived ? '💰 Money Received ✓' : '⏳ Mark Money Received'}</span>
                        </button>
                        {order.status === 'new' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'processed')}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Mark as Processed</span>
                          </button>
                        )}

                        {order.status === 'processed' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'shipped')}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Mark as Shipped</span>
                          </button>
                        )}

                        {order.status === 'shipped' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Delivered</span>
                          </button>
                        )}

                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-white border border-rose-200 text-xs text-[#2a160d] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-rose-500 font-semibold"
                        >
                          <option value="new">New</option>
                          <option value="processed">Processed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Information & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      {/* Customer Contact Card */}
                      <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-rose-900 uppercase tracking-wider text-[10px] font-bold">
                            Customer Contact
                          </span>
                          <span className="text-rose-700 font-bold text-[11px]">
                            📞 Call to Take Payment
                          </span>
                        </div>
                        <p className="font-serif font-bold text-base text-[#2a160d]">
                          {order.customer.name}
                        </p>
                        <p className="text-[#7c5c47]">
                          Email: <strong className="text-rose-900">{order.customer.email || 'None'}</strong>
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-[#2a160d] border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5 text-rose-600" />
                            <span>Call {order.customer.phone}</span>
                          </a>

                          <a
                            href={`https://wa.me/${cleanPhone}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      </div>

                      {/* Delivery Destination */}
                      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-1.5 text-[#523321]">
                        <span className="text-amber-900 uppercase tracking-wider text-[10px] font-bold block">
                          Delivery Destination
                        </span>
                        <p className="text-[#2a160d] font-medium">
                          {order.customer.address}
                          {order.customer.landmark ? `, Landmark: ${order.customer.landmark}` : ''}
                        </p>
                        <p className="font-bold text-amber-800">
                          {order.customer.city} - {order.customer.pincode}
                        </p>
                        <p className="text-[11px] text-[#7c5c47]">
                          📅 Preferred Slot: <strong>{order.customer.deliveryDate}</strong> ({order.customer.timeSlot})
                        </p>
                      </div>

                    </div>

                    {/* Ordered Items */}
                    <div className="bg-white border border-rose-100 rounded-2xl p-4 space-y-1.5">
                      <div className="divide-y divide-rose-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-serif font-bold text-[#2a160d]">
                                {item.chocolate.name}
                              </span>
                              <span className="text-[#7c5c47] ml-2 font-medium">
                                [{item.selectedBox.label}]
                              </span>
                              {item.customGiftNote && (
                                <p className="text-[11px] text-rose-700 italic">
                                  🎁 Card: "{item.customGiftNote}"
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[#7c5c47] mr-2">Qty: {item.quantity}</span>
                              <span className="font-bold text-[#be123c]">
                                ₹{item.selectedBox.price * item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-rose-100 flex justify-between items-center text-xs font-bold">
                        <span className="text-[#7c5c47]">Total to Collect:</span>
                        <span className="text-lg text-[#be123c] font-serif">₹{order.total}</span>
                      </div>
                    </div>

                    {/* Email Statuses & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-rose-100">
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {order.gmailSent ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Notification to Sunita: Sent
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" /> Sunita Notification: Pending
                          </span>
                        )}

                        {order.customer.email && (
                          order.buyerGmailSent ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Buyer Confirmation: Sent ({order.customer.email})
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1 font-semibold">
                              <Mail className="w-3.5 h-3.5" /> Buyer Confirmation: Not dispatched yet
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setPreviewEmailData({ order, isForSeller: false })}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-900 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
                          <span>Preview Receipt</span>
                        </button>

                        <a
                          href={generateGmailWebUrl(order, SELLER_EMAIL)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Open pre-filled order email in Gmail Web compose"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber-600" />
                          <span>Open in Gmail</span>
                        </a>

                        <button
                          onClick={() => handleSendDualEmailsViaGmail(order)}
                          disabled={isSendingEmail}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs hover:opacity-95 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send / Resend Dual Emails</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Inventory Tracking */}
        {activeTab === 'inventory' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-gradient-to-b from-[#fffdfa] to-white">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-medium">
              💡 <strong>Kitchen Inventory Management:</strong> Stock decrements automatically whenever an order is confirmed. You can adjust the batch quantities below.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chocolates.map((choc) => (
                <div
                  key={choc.id}
                  className="bg-white border-2 border-rose-100 rounded-2xl p-4 space-y-3 shadow-xs hover:border-rose-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={choc.image}
                      alt={choc.name}
                      className="w-12 h-12 rounded-xl object-cover border border-rose-200"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-serif font-bold text-xs truncate text-[#2a160d]">
                        {choc.name}
                      </h5>
                      <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold">
                        {choc.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-rose-100">
                    <span className="text-xs font-bold text-[#7c5c47]">Stock:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateStock(choc.id, Math.max(0, choc.stock - 1))}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-[#2a160d]">
                        {choc.stock}
                      </span>
                      <button
                        onClick={() => onUpdateStock(choc.id, choc.stock + 1)}
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Receipt Preview Modal */}
        {previewEmailData && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-rose-200">
              <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-rose-200 flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-[#2a160d]">
                  Email HTML Preview for #{previewEmailData.order.id}
                </span>
                <button
                  onClick={() => setPreviewEmailData(null)}
                  className="p-1 rounded-full hover:bg-rose-100 text-rose-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div
                className="p-6 overflow-y-auto flex-1 text-xs"
                dangerouslySetInnerHTML={{
                  __html: buildOrderEmailHtml(previewEmailData.order, previewEmailData.isForSeller),
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
