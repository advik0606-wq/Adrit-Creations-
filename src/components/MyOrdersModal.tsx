import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Package, Sparkles, Clock, ChefHat, Truck, CheckCircle2, 
  Phone, MessageSquare, ArrowRight, Search, ShieldCheck, Mail, 
  Calendar, MapPin, AlertCircle, RefreshCw, Bell, BellRing,
  Volume2, VolumeX, Eye, ArrowUpRight, Zap
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { SELLER_PHONE, SELLER_EMAIL, generateWhatsAppUrl } from '../services/gmailService';
import { User } from 'firebase/auth';

export interface OrderStatusToast {
  id: string;
  orderId: string;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  title: string;
  message: string;
  timestamp: Date;
  statusType: 'new' | 'processed' | 'shipped' | 'delivered' | 'cancelled' | 'payment';
}

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

/**
 * Synthesizes a sweet, pleasant acoustic chime using the browser Web Audio API.
 * Pure native browser audio with zero external dependencies.
 */
function playStatusToastChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const playTone = (freq: number, startOffset: number, duration: number, vol = 0.08) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(vol, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    // Harmonic sweet triad (E5 -> A5 -> C#6)
    playTone(659.25, 0, 0.22, 0.08);
    playTone(880.00, 0.1, 0.28, 0.09);
    playTone(1108.73, 0.22, 0.45, 0.1);
  } catch (err) {
    // Graceful fallback for strict autoplay policy
  }
}

/**
 * Formats custom status titles and descriptions
 */
function getStatusMeta(
  status: OrderStatus,
  orderId: string,
  isPayment = false
): { title: string; message: string; type: OrderStatusToast['statusType'] } {
  if (isPayment) {
    return {
      title: 'Payment Confirmed! 💰✅',
      message: `Sunita has verified receipt of payment for Order #${orderId}. Your chocolates are all set!`,
      type: 'payment',
    };
  }

  switch (status) {
    case 'processed':
      return {
        title: 'In Kitchen • Handcrafting Started! 👩‍🍳',
        message: `Mom Sunita has started tempering couverture for Order #${orderId}.`,
        type: 'processed',
      };
    case 'shipped':
      return {
        title: 'Dispatched & Out for Delivery! 🚚💨',
        message: `Order #${orderId} is packed with cold insulation and dispatched to your address!`,
        type: 'shipped',
      };
    case 'delivered':
      return {
        title: 'Delivered Fresh to Doorstep! 🎉🍫',
        message: `Order #${orderId} has arrived fresh. Enjoy your artisan chocolates!`,
        type: 'delivered',
      };
    case 'cancelled':
      return {
        title: 'Order Cancelled ⚠️',
        message: `Order #${orderId} has been marked as cancelled.`,
        type: 'cancelled',
      };
    case 'new':
    default:
      return {
        title: 'Order Confirmed in Kitchen! ✨',
        message: `Order #${orderId} is confirmed and scheduled for fresh batch preparation.`,
        type: 'new',
      };
  }
}

/**
 * Individual Toast Notification Card with auto-dismiss progress bar
 */
interface ToastCardProps {
  toast: OrderStatusToast;
  onDismiss: (id: string) => void;
  onHighlight: (orderId: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss, onHighlight }) => {
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    const duration = 6500;
    const intervalTime = 50;
    const decrement = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.id, onDismiss]);

  const getStyleForType = () => {
    switch (toast.statusType) {
      case 'processed':
        return {
          border: 'border-purple-300',
          bg: 'bg-gradient-to-br from-purple-50/95 via-white to-purple-50/60',
          iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-purple-600/30',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-200',
          barColor: 'bg-purple-500',
          icon: <ChefHat className="w-5 h-5 animate-pulse" />,
        };
      case 'shipped':
        return {
          border: 'border-blue-300',
          bg: 'bg-gradient-to-br from-blue-50/95 via-white to-sky-50/60',
          iconBg: 'bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-blue-600/30',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
          barColor: 'bg-blue-500',
          icon: <Truck className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />,
        };
      case 'delivered':
        return {
          border: 'border-emerald-300',
          bg: 'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/60',
          iconBg: 'bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-emerald-600/30',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          barColor: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-5 h-5" />,
        };
      case 'payment':
        return {
          border: 'border-amber-400',
          bg: 'bg-gradient-to-br from-amber-50/95 via-white to-emerald-50/50',
          iconBg: 'bg-gradient-to-br from-amber-500 to-emerald-600 text-white shadow-amber-500/30',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          barColor: 'bg-gradient-to-r from-amber-500 to-emerald-500',
          icon: <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />,
        };
      case 'cancelled':
        return {
          border: 'border-rose-300',
          bg: 'bg-gradient-to-br from-rose-50/95 via-white to-rose-50/50',
          iconBg: 'bg-rose-600 text-white shadow-rose-600/30',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
          barColor: 'bg-rose-500',
          icon: <AlertCircle className="w-5 h-5" />,
        };
      case 'new':
      default:
        return {
          border: 'border-amber-300',
          bg: 'bg-gradient-to-br from-amber-50/95 via-white to-rose-50/50',
          iconBg: 'bg-amber-600 text-white shadow-amber-600/30',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          barColor: 'bg-amber-500',
          icon: <Clock className="w-5 h-5" />,
        };
    }
  };

  const style = getStyleForType();

  return (
    <div
      role="alert"
      className={`relative overflow-hidden w-full ${style.bg} backdrop-blur-md border-2 ${style.border} rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl animate-slideInRight pointer-events-auto`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-md`}>
          {style.icon}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${style.badgeBg} uppercase tracking-wider`}>
              Backend Live Alert
            </span>
            <span className="text-xs font-bold text-rose-950 font-serif">
              #{toast.orderId}
            </span>
            <span className="text-[10px] text-gray-500 ml-auto">
              Just now
            </span>
          </div>

          <h5 className="font-bold text-xs sm:text-sm text-[#2a160d] leading-snug">
            {toast.title}
          </h5>
          <p className="text-xs text-[#6b4733] mt-1 leading-relaxed">
            {toast.message}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => onHighlight(toast.orderId)}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-900 hover:text-rose-950 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <span>View & Track Order</span>
              <ArrowRight className="w-3 h-3 text-rose-600" />
            </button>
          </div>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-dismiss countdown bar */}
      <div className="h-1 w-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full ${style.barColor} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  currentUser,
  onGoogleSignIn,
  onLogout,
  onOpenAuthModal,
  onUpdateOrderStatus,
}) => {
  if (!isOpen) return null;

  const [lookupQuery, setLookupQuery] = useState<string>('');

  // Toast Notification System States
  const [activeToasts, setActiveToasts] = useState<OrderStatusToast[]>([]);
  const [toastHistory, setToastHistory] = useState<OrderStatusToast[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('adrit_sound_alerts');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  // References for tracking previous order statuses across renders
  const prevOrdersRef = useRef<Map<string, { status: OrderStatus; moneyReceived?: boolean }>>(new Map());
  const isInitialMount = useRef<boolean>(true);

  // Save sound setting
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('adrit_sound_alerts', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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

  /**
   * Helper to trigger a toast alert
   */
  const triggerToast = useCallback(
    (orderId: string, newStatus: OrderStatus, previousStatus?: OrderStatus, isPayment = false) => {
      const meta = getStatusMeta(newStatus, orderId, isPayment);
      const newToast: OrderStatusToast = {
        id: `${orderId}-${newStatus}-${Date.now()}-${Math.random()}`,
        orderId,
        newStatus,
        previousStatus,
        title: meta.title,
        message: meta.message,
        timestamp: new Date(),
        statusType: meta.type,
      };

      if (soundEnabled) {
        playStatusToastChime();
      }

      setActiveToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Keep max 4 visible
      setToastHistory((prev) => [newToast, ...prev.slice(0, 19)]); // Keep 20 in history
    },
    [soundEnabled]
  );

  const dismissToast = useCallback((toastId: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const handleHighlightOrder = useCallback((orderId: string) => {
    setHighlightedOrderId(orderId);
    const element = document.getElementById(`order-card-${orderId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      setHighlightedOrderId((curr) => (curr === orderId ? null : curr));
    }, 4500);
  }, []);

  // 1. Detect status changes whenever `orders` prop updates
  useEffect(() => {
    if (!isOpen) {
      isInitialMount.current = true;
      return;
    }

    if (isInitialMount.current) {
      // First mount: seed the tracking map with current statuses without alerting
      const initialMap = new Map<string, { status: OrderStatus; moneyReceived?: boolean }>();
      orders.forEach((o) => {
        initialMap.set(o.id, { status: o.status, moneyReceived: o.moneyReceived });
      });
      prevOrdersRef.current = initialMap;
      isInitialMount.current = false;
      return;
    }

    // Subsequent updates: check for status transitions
    orders.forEach((order) => {
      // Notify only if order belongs to the customer (or if lookup query matches)
      const isUserOrder = userOrders.some((uo) => uo.id === order.id);
      if (!isUserOrder) return;

      const prev = prevOrdersRef.current.get(order.id);
      if (prev) {
        if (prev.status !== order.status) {
          triggerToast(order.id, order.status, prev.status, false);
          handleHighlightOrder(order.id);
        } else if (!prev.moneyReceived && order.moneyReceived) {
          triggerToast(order.id, order.status, prev.status, true);
          handleHighlightOrder(order.id);
        }
      }

      // Update ref
      prevOrdersRef.current.set(order.id, {
        status: order.status,
        moneyReceived: order.moneyReceived,
      });
    });
  }, [orders, isOpen, userOrders, triggerToast, handleHighlightOrder]);

  // 2. Listen to custom window status events (immediate dispatch within application)
  useEffect(() => {
    if (!isOpen) return;

    const handleCustomStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail || !detail.orderId) return;

      const isUserOrder = userOrders.some((uo) => uo.id === detail.orderId) ||
        lookupQuery.toLowerCase().includes(detail.orderId.toLowerCase());

      if (isUserOrder) {
        triggerToast(detail.orderId, detail.newStatus, undefined, detail.isPayment);
        handleHighlightOrder(detail.orderId);
      }
    };

    window.addEventListener('adrit_order_status_changed', handleCustomStatusChange);
    return () => {
      window.removeEventListener('adrit_order_status_changed', handleCustomStatusChange);
    };
  }, [isOpen, userOrders, lookupQuery, triggerToast, handleHighlightOrder]);

  // 3. Periodic Background Sync (every 3s): checks backend/localStorage updates across tabs
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      try {
        const raw = localStorage.getItem('adrit_orders_v2');
        if (!raw) return;
        const storedOrders: Order[] = JSON.parse(raw);

        storedOrders.forEach((order) => {
          const isUserOrder = userOrders.some((uo) => uo.id === order.id);
          if (!isUserOrder) return;

          const prev = prevOrdersRef.current.get(order.id);
          if (prev) {
            if (prev.status !== order.status) {
              triggerToast(order.id, order.status, prev.status, false);
              handleHighlightOrder(order.id);
            } else if (!prev.moneyReceived && order.moneyReceived) {
              triggerToast(order.id, order.status, prev.status, true);
              handleHighlightOrder(order.id);
            }
          }

          prevOrdersRef.current.set(order.id, {
            status: order.status,
            moneyReceived: order.moneyReceived,
          });
        });
      } catch (err) {
        // quiet fallback
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, userOrders, triggerToast, handleHighlightOrder]);

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
          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Order Confirmed &bull; Preparing</span>
          </span>
        );
      case 'processed':
        return (
          <span className="bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <ChefHat className="w-3.5 h-3.5 text-purple-600" />
            <span>In Kitchen &bull; Handcrafting</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Out for Delivery / Dispatched</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
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

  // Helper for test simulator
  const getNextStatus = (current: OrderStatus): OrderStatus => {
    switch (current) {
      case 'new':
        return 'processed';
      case 'processed':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      case 'delivered':
        return 'new';
      case 'cancelled':
        return 'new';
      default:
        return 'processed';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white border-2 border-rose-200 rounded-3xl shadow-2xl overflow-hidden text-[#2c180e] my-6 max-h-[92vh] flex flex-col">
        
        {/* Floating In-Modal Toast Notification Container */}
        {activeToasts.length > 0 && (
          <div className="absolute top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none">
            {activeToasts.map((toast) => (
              <ToastCard
                key={toast.id}
                toast={toast}
                onDismiss={dismissToast}
                onHighlight={handleHighlightOrder}
              />
            ))}
          </div>
        )}

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

        {/* Live Status Alerts Bar */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-50/90 via-amber-50/80 to-rose-50/90 border-b border-rose-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="font-bold text-emerald-950 text-[11px] sm:text-xs">
              Live Backend Status Sync: Active
            </span>
            <span className="text-[10px] text-[#7c5c47] hidden md:inline">
              &bull; Real-time toast alerts on kitchen & delivery changes
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute alert chimes' : 'Unmute alert chimes'}
              className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-gray-400" />}
              <span className="text-[10px] hidden sm:inline">{soundEnabled ? 'Chime On' : 'Chime Off'}</span>
            </button>

            {/* Alert History Toggle */}
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="relative p-1.5 px-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-[10px] font-bold">Alerts</span>
              {toastHistory.length > 0 && (
                <span className="bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {toastHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Recent Alerts Drawer / Dropdown */}
        {isHistoryOpen && (
          <div className="bg-white border-b-2 border-rose-200 p-4 shadow-inner max-h-56 overflow-y-auto space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-rose-600" />
                <span>Backend Status Updates History ({toastHistory.length})</span>
              </span>
              {toastHistory.length > 0 && (
                <button
                  onClick={() => setToastHistory([])}
                  className="text-[10px] text-rose-700 hover:text-rose-900 font-bold hover:underline cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {toastHistory.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">
                No status changes detected yet in this session. When Sunita updates your order status in the backend, alerts will record here!
              </p>
            ) : (
              <div className="space-y-2">
                {toastHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-rose-950 font-serif">#{item.orderId}</span>
                        <span className="text-[10px] font-semibold text-rose-800">&bull; {item.title}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">{item.message}</p>
                    </div>
                    <button
                      onClick={() => handleHighlightOrder(item.orderId)}
                      className="px-2 py-1 text-[10px] font-bold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      Track
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <strong className="text-amber-950 text-sm block font-bold">
                    Sign in to view your orders directly in your user profile
                  </strong>
                  <span className="text-[#6b4733] text-xs">
                    Sign in with your Firebase or Google account to automatically link and view all your past chocolate orders and real-time statuses.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal();
                  else onGoogleSignIn();
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold hover:opacity-95 shadow-md shadow-rose-600/20 transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                Sign in with Firebase
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
              className="w-full bg-white border border-rose-200 rounded-2xl pl-10 pr-20 py-2.5 text-xs text-[#2a160d] placeholder-[#8c6550] focus:outline-none focus:border-rose-500 shadow-2xs"
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
            <div className="text-center py-12 space-y-4 bg-white border border-rose-100 rounded-3xl p-8 shadow-2xs">
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

              {/* Demo test toast trigger if user wants to preview the toast system without an order */}
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    triggerToast('DEMO-KITCHEN', 'processed', 'new', false);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ChefHat className="w-3.5 h-3.5 text-purple-600" />
                  <span>Preview Kitchen Toast</span>
                </button>
                <button
                  onClick={() => {
                    triggerToast('DEMO-DELIVERY', 'shipped', 'processed', false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preview Delivery Toast</span>
                </button>
              </div>
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
                const isHighlighted = highlightedOrderId === order.id;

                return (
                  <div
                    id={`order-card-${order.id}`}
                    key={order.id}
                    className={`bg-white border-2 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm transition-all duration-500 ${
                      isHighlighted
                        ? 'border-rose-500 ring-4 ring-rose-400/50 shadow-2xl bg-gradient-to-b from-rose-50/50 to-white scale-[1.01]'
                        : 'border-rose-100 hover:shadow-md'
                    }`}
                  >
                    {/* Top Row: Order ID, Status Badge, and Date */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
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
                          {isHighlighted && (
                            <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                              <Sparkles className="w-3 h-3 text-rose-600" />
                              <span>Status Updated Just Now!</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7c5c47] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Deliver to: <strong className="text-[#2a160d]">{order.customer.address}, {order.customer.city} - {order.customer.pincode}</strong></span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Visual Progress Timeline (Steps 1 to 4) */}
                    {order.status !== 'cancelled' && (
                      <div className="bg-gradient-to-r from-rose-50/60 via-amber-50/60 to-emerald-50/60 rounded-2xl p-4 border border-rose-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block">
                            Live Kitchen Tracking Status:
                          </span>

                          {/* Quick Interactive Status Advance Simulator (allows test & live alert trigger) */}
                          {onUpdateOrderStatus && (
                            <button
                              onClick={() => {
                                const next = getNextStatus(order.status);
                                onUpdateOrderStatus(order.id, next);
                              }}
                              title="Simulate backend status change for testing toast alerts"
                              className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-900 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span>Simulate Status Advance</span>
                            </button>
                          )}
                        </div>
                        
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
                                className="w-12 h-12 rounded-xl object-cover border border-rose-200 shrink-0 shadow-2xs"
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
                          className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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
