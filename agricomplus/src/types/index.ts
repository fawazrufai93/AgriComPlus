export type CategoryId = 'all' | 'tubers' | 'vegetables' | 'grains' | 'fruits' | 'oils';

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string;
  count: number;
}

export interface Credential {
  id: string;
  label: string;
  issuer: string;
  icon: string;
  verifiedDate: string;
}

export interface Farm {
  id: string;
  name: string;
  cluster: string;
  location: string;
  region: string;
  bio: string;
  practices: string[];
  certifications: Credential[];
  photo: string;
  farmerName: string;
  farmerPhoto: string;
  rating: number;
  reviewsCount: number;
  establishedYear: number;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Product {
  id: string;
  name: string;
  localName?: string;
  category: CategoryId;
  price: number;
  originalPrice: number;
  discountPercent: number;
  unit: string;
  weight: string;
  images: string[];
  farmId: string;
  description: string;
  healthTags: string[];
  inStock: boolean;
  stockCount: number;
  harvestDate: string;
  shelfLife: string;
  nutritionHighlights: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  title: string;
  area: string;
  landmark: string;
  city: string;
  recipientPhone: string;
  isDefault: boolean;
}

export type PaymentMethodType = 'momo' | 'card' | 'cod';

export interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  subtitle: string;
  provider?: 'mtn' | 'telecel' | 'at';
  icon: string;
}

export interface TraceEvent {
  id: string;
  stage: 'Farm' | 'Harvest' | 'Pack' | 'Delivery';
  title: string;
  timestamp: string;
  location: string;
  description: string;
  verifiedBy: string;
  status: 'completed' | 'in-progress' | 'pending';
  temperature?: string;
  badge?: string;
}

export interface Order {
  id: string;
  traceCode: string;
  placedAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: Address;
  paymentMethod: {
    type: PaymentMethodType;
    details: string;
  };
  status: 'Order Placed' | 'Harvested & Packed' | 'Out for Delivery' | 'Delivered';
  estimatedDelivery: string;
  farmIds: string[];
  traceEvents: TraceEvent[];
  paymentStatus?: PaymentStatus;
  paymentReference?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  userId?: string | null;
}

export type OrderStatus = Order['status'];
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'pay_on_delivery';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Address[];
  joinedDate: string;
  savedItemIds?: string[];
  role?: 'customer' | 'admin';
}

export type ActiveTab = 'home' | 'categories' | 'cart' | 'account';

export type AuthState = 'authenticated' | 'guest';

export type ScreenState =
  | { type: 'onboarding' }
  | { type: 'auth'; initialMode?: 'login' | 'signup' | 'landing'; returnTo?: ScreenState }
  | { type: 'home' }
  | { type: 'categories' }
  | { type: 'product_details'; productId: string }
  | { type: 'farmer_profile'; farmId: string }
  | { type: 'cart' }
  | { type: 'checkout' }
  | { type: 'order_success'; orderId: string }
  | { type: 'traceability'; traceCode: string; orderId?: string }
  | { type: 'account' }
  | { type: 'admin' };
