export type Category = 
  | 'all'
  | 'crochet'
  | 'dark'
  | 'pista'
  | 'pineapple'
  | 'strawberry'
  | 'hampers'
  | 'truffles'
  | 'nuts'
  | 'bonbons'
  | 'sugarfree';

export interface BoxOption {
  label: string;
  count: string;
  price: number;
  popular?: boolean;
}

export interface Chocolate {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'truffles' | 'nuts' | 'hampers' | 'dark' | 'bonbons' | 'sugarfree' | 'crochet';
  productType?: 'chocolate' | 'crochet';
  flavour?: 'dark' | 'pista' | 'pineapple' | 'strawberry-white' | 'assorted' | 'none';
  mouldShape?: string;
  mouldType?: string;
  crochetDetails?: {
    yarnType?: string;
    colors?: string[];
    dimensions?: string;
    handmadeBy?: string;
  };
  basePrice: number;
  boxOptions: BoxOption[];
  cocoaPercentage: number;
  ingredients: string[];
  dietary: string[];
  image: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  shelfLife: string;
  inStock: boolean;
  stock: number;
  lowStockThreshold: number;
  isFeatured?: boolean;
  featuredHighlight?: string;
}

export interface CartItem {
  id: string;
  chocolate: Chocolate;
  selectedBox: BoxOption;
  quantity: number;
  customGiftNote?: string;
  ribbonColor?: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  landmark?: string;
  city: string;
  pincode: string;
  deliveryDate: string;
  timeSlot: string;
  paymentPreference: string; // e.g. "Sunita will contact via Phone/WhatsApp to take payment"
  specialInstructions?: string;
}

export type OrderStatus = 'new' | 'processed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerDetails;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  gmailSent: boolean;
  gmailMessageId?: string;
  buyerGmailSent?: boolean;
  buyerGmailMessageId?: string;
  sellerNotes?: string;
  moneyReceived?: boolean;
  moneyReceivedAt?: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  customerCity: string;
  rating: number;
  chocolateName: string;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}
