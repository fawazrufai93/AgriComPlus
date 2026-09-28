import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  User,
  Address,
  PaymentMethodType,
  ScreenState,
  ActiveTab,
  CategoryId,
  TraceEvent,
  AuthState,
} from '../types';
import { PRODUCTS, FARMS, INITIAL_USER, GUEST_USER, INITIAL_ORDERS } from '../data/mockData';
import {
  supabase,
  signUpWithEmail as supabaseSignUp,
  signInWithEmailPassword,
  signInWithGoogleOAuth,
  sendPasswordReset as supabaseSendPasswordReset,
  signOutUser,
  SupabaseUser,
} from '../lib/supabase';

interface AppContextType {
  screen: ScreenState;
  activeTab: ActiveTab;
  cart: CartItem[];
  orders: Order[];
  currentUser: User;
  supabaseUser: SupabaseUser | null;
  authState: AuthState;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  selectedAddress: Address;
  deliveryArea: string;
  searchQuery: string;
  selectedCategory: CategoryId;
  isQRScannerOpen: boolean;
  activeProduct: Product | null;
  activeFarmId: string | null;
  activeTraceCode: string | null;
  activeOrder: Order | null;
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;

  savedItemIds: string[];
  isSaved: (productId: string) => boolean;
  toggleSaveItem: (productId: string) => void;

  goToScreen: (screen: ScreenState) => void;
  requireAuth: (targetScreen: ScreenState) => boolean;
  setActiveTab: (tab: ActiveTab) => void;
  setDeliveryArea: (area: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: CategoryId) => void;
  setSelectedAddress: (address: Address) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (address: Address, paymentMethod: { type: PaymentMethodType; details: string }) => Promise<Order>;
  viewProductDetails: (productId: string) => void;
  viewFarmerProfile: (farmId: string) => void;
  viewTraceability: (traceCode: string, orderId?: string) => void;
  openQRScanner: () => void;
  closeQRScanner: () => void;
  addAddress: (newAddr: Omit<Address, 'id'>) => void;
  updateUser: (updates: Partial<User>) => void;
  startOnboarding: () => void;

  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName: string, username: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_CART = 'agricom_cart_v1';
const LOCAL_STORAGE_ORDERS = 'agricom_orders_v1';
const LOCAL_STORAGE_SAVED = 'agricom_saved_items_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<ScreenState>({ type: 'home' });
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [selectedAddress, setSelectedAddress] = useState<Address>(GUEST_USER.addresses[0]);
  const [deliveryArea, setDeliveryArea] = useState<string>('Ahodwo, Kumasi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);

  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SAVED);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['prod-yam-pona', 'prod-tomatoes'];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      { product: PRODUCTS[0], quantity: 1 },
      { product: PRODUCTS[1], quantity: 2 },
    ];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  // Loads/creates the profile row + any saved orders for a signed-in user,
  // mirroring the merge-on-login behaviour of the old Firebase code.
  const syncUserFromSupabase = async (user: SupabaseUser) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile) {
        setCurrentUser((prev) => ({
          ...prev,
          id: user.id,
          name: profile.name || prev.name,
          email: user.email || prev.email,
          avatar: profile.avatar || prev.avatar,
          username: profile.username || user.email?.split('@')[0] || prev.username,
          addresses:
            profile.addresses && profile.addresses.length > 0 ? profile.addresses : prev.addresses,
        }));
        if (profile.addresses && profile.addresses.length > 0) {
          setSelectedAddress(profile.addresses[0]);
        }
        const remoteSaved: string[] = Array.isArray(profile.saved_item_ids) ? profile.saved_item_ids : [];
        const mergedSaved = Array.from(new Set([...remoteSaved, ...savedItemIds]));
        if (mergedSaved.length > remoteSaved.length) {
          supabase
            .from('profiles')
            .update({ saved_item_ids: mergedSaved })
            .eq('id', user.id)
            .then(() => {});
        }
        setSavedItemIds(mergedSaved);
      } else {
        const newUserProfile: User = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kumasi Buyer',
          username: user.email?.split('@')[0] || 'buyer_gh',
          email: user.email || '',
          phone: '+233 24 550 4821',
          avatar:
            user.user_metadata?.avatar_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          addresses: INITIAL_USER.addresses,
          joinedDate: `Joined ${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`,
          savedItemIds,
        };
        await supabase.from('profiles').upsert({
          id: newUserProfile.id,
          name: newUserProfile.name,
          username: newUserProfile.username,
          email: newUserProfile.email,
          phone: newUserProfile.phone,
          avatar: newUserProfile.avatar,
          addresses: newUserProfile.addresses,
          saved_item_ids: newUserProfile.savedItemIds,
          joined_date: newUserProfile.joinedDate,
        });
        setCurrentUser(newUserProfile);
      }

      try {
        const { data: remoteOrders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id);
        if (ordersError) throw ordersError;
        if (remoteOrders && remoteOrders.length > 0) {
          const mapped: Order[] = remoteOrders.map((row) => ({
            id: row.id,
            traceCode: row.trace_code,
            placedAt: row.placed_at,
            items: row.items,
            subtotal: row.subtotal,
            deliveryFee: row.delivery_fee,
            total: row.total,
            deliveryAddress: row.delivery_address,
            paymentMethod: row.payment_method,
            status: row.status,
            estimatedDelivery: row.estimated_delivery,
            farmIds: row.farm_ids,
            traceEvents: row.trace_events,
          }));
          setOrders((prev) => {
            const combined = [...mapped, ...prev.filter((p) => !mapped.some((r) => r.id === p.id))];
            return combined;
          });
        }
      } catch (e) {
        console.warn('Error fetching Supabase orders', e);
      }
    } catch (err) {
      console.warn('Error syncing user profile from Supabase', err);
    }
  };

  useEffect(() => {
    // Restore any existing session on load.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setSupabaseUser(user);
      if (user) {
        syncUserFromSupabase(user).finally(() => setIsAuthLoading(false));
      } else {
        setCurrentUser(GUEST_USER);
        setIsAuthLoading(false);
      }
    });

    // Keep in sync with sign-in / sign-out / token refresh events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setSupabaseUser(user);
      if (user) {
        syncUserFromSupabase(user);
      } else {
        setCurrentUser(GUEST_USER);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not persist cart', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('Could not persist orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(savedItemIds));
    } catch (e) {
      console.warn('Could not persist saved items', e);
    }
  }, [savedItemIds]);

  const isSaved = (productId: string) => savedItemIds.includes(productId);

  const toggleSaveItem = (productId: string) => {
    setSavedItemIds((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      if (supabaseUser) {
        supabase
          .from('profiles')
          .update({ saved_item_ids: updated })
          .eq('id', supabaseUser.id)
          .then(({ error }) => {
            if (error) console.warn('Could not update saved items in Supabase', error);
          });
      }
      return updated;
    });
  };

  const deliveryFee = 15;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + deliveryFee : 0;

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const goToScreen = (newScreen: ScreenState) => {
    setScreen(newScreen);
    if (newScreen.type === 'home') setActiveTab('home');
    else if (newScreen.type === 'categories') setActiveTab('categories');
    else if (newScreen.type === 'cart') setActiveTab('cart');
    else if (newScreen.type === 'account') setActiveTab('account');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewProductDetails = (productId: string) => {
    goToScreen({ type: 'product_details', productId });
  };

  const viewFarmerProfile = (farmId: string) => {
    goToScreen({ type: 'farmer_profile', farmId });
  };

  const viewTraceability = (traceCode: string, orderId?: string) => {
    goToScreen({ type: 'traceability', traceCode, orderId });
  };

  const openQRScanner = () => setIsQRScannerOpen(true);
  const closeQRScanner = () => setIsQRScannerOpen(false);

  const placeOrder = async (
    address: Address,
    paymentMethod: { type: PaymentMethodType; details: string }
  ): Promise<Order> => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const traceCode = `TRACE-KMS-${Date.now().toString().slice(-4)}-${orderNum}`;
    const farmIds = Array.from(new Set(cart.map((item) => item.product.farmId)));
    const primaryFarm = FARMS[farmIds[0]] || FARMS['farm-ejisu'];

    const newTraceEvents: TraceEvent[] = [
      {
        id: `ev-${Date.now()}-1`,
        stage: 'Farm',
        title: 'Certified Harvest at Source Farm',
        timestamp: 'Just now',
        location: `${primaryFarm.name}, ${primaryFarm.location}`,
        description: `Produce verified direct from ${primaryFarm.farmerName}. Clean soil and zero chemical residue verified.`,
        verifiedBy: 'Farm Lead & MoFA Cert Officer',
        status: 'completed',
        temperature: '23°C Ambient',
        badge: 'MoFA Certified',
      },
      {
        id: `ev-${Date.now()}-2`,
        stage: 'Harvest',
        title: 'Dawn Sorting & Cold Packaging',
        timestamp: 'Within 2 hours',
        location: 'AgriCom+ Kumasi Sorting Hub (Kaase)',
        description: 'Packed in biodegradable breathable packaging with tamper-resistant QR seal.',
        verifiedBy: 'AgriCom+ Pack Inspector L. Mensah',
        status: 'in-progress',
      },
      {
        id: `ev-${Date.now()}-3`,
        stage: 'Pack',
        title: 'Batch Consolidated & Tagged',
        timestamp: 'Pending packaging',
        location: 'Kaase Hub, Kumasi',
        description: `Assigned unique tamper QR trace code: ${traceCode}`,
        verifiedBy: 'Digital Registry #ACP-GH',
        status: 'pending',
      },
      {
        id: `ev-${Date.now()}-4`,
        stage: 'Delivery',
        title: 'Express Dispatch to Kumasi Buyer',
        timestamp: 'Estimated within 3 hours',
        location: `${address.title} - ${address.area}`,
        description: `Delivered by AgriCom+ rider to ${address.recipientPhone}.`,
        verifiedBy: 'Kumasi Metro Logistics',
        status: 'pending',
      },
    ];

    const newOrder: Order = {
      id: `ACP-KMS-2026-${orderNum}`,
      traceCode,
      placedAt: 'Just now',
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      deliveryAddress: address,
      paymentMethod,
      status: 'Order Placed',
      estimatedDelivery: 'Today within 2–3 hours (Kumasi Metro)',
      farmIds,
      traceEvents: newTraceEvents,
    };

    try {
      const orderRow = {
        id: newOrder.id,
        user_id: supabaseUser?.id || null,
        trace_code: newOrder.traceCode,
        placed_at: newOrder.placedAt,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        delivery_fee: newOrder.deliveryFee,
        total: newOrder.total,
        delivery_address: newOrder.deliveryAddress,
        payment_method: newOrder.paymentMethod,
        status: newOrder.status,
        estimated_delivery: newOrder.estimatedDelivery,
        farm_ids: newOrder.farmIds,
        trace_events: newOrder.traceEvents,
      };
      const { error } = await supabase.from('orders').insert(orderRow);
      if (error) throw error;
    } catch (err) {
      console.warn('Could not save order to Supabase', err);
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const addAddress = async (newAddr: Omit<Address, 'id'>) => {
    const id = `addr-${Date.now()}`;
    const fullAddress: Address = { ...newAddr, id };
    const updatedAddresses = [fullAddress, ...currentUser.addresses];

    setCurrentUser((prev) => ({
      ...prev,
      addresses: updatedAddresses,
    }));
    setSelectedAddress(fullAddress);

    if (supabaseUser) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ addresses: updatedAddresses })
          .eq('id', supabaseUser.id);
        if (error) throw error;
      } catch (err) {
        console.warn('Could not update addresses in Supabase', err);
      }
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    if (supabaseUser) {
      try {
        // Map camelCase app fields to the snake_case profiles columns.
        const row: Record<string, unknown> = {};
        if (updates.name !== undefined) row.name = updates.name;
        if (updates.username !== undefined) row.username = updates.username;
        if (updates.email !== undefined) row.email = updates.email;
        if (updates.phone !== undefined) row.phone = updates.phone;
        if (updates.avatar !== undefined) row.avatar = updates.avatar;
        if (updates.addresses !== undefined) row.addresses = updates.addresses;
        if (updates.savedItemIds !== undefined) row.saved_item_ids = updates.savedItemIds;
        const { error } = await supabase.from('profiles').update(row).eq('id', supabaseUser.id);
        if (error) throw error;
      } catch (err) {
        console.warn('Could not update user in Supabase', err);
      }
    }
  };

  const startOnboarding = () => {
    goToScreen({ type: 'onboarding' });
  };

  const navigateAfterAuth = () => {
    if (screen.type === 'auth' && screen.returnTo) {
      goToScreen(screen.returnTo);
    } else {
      goToScreen({ type: 'home' });
    }
  };

  const requireAuth = (targetScreen: ScreenState): boolean => {
    if (supabaseUser) {
      goToScreen(targetScreen);
      return true;
    }
    goToScreen({ type: 'auth', initialMode: 'landing', returnTo: targetScreen });
    return false;
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string, username: string) => {
    const { user } = await supabaseSignUp(email, pass);
    if (!user) {
      // Email confirmation is required before a session exists; there's no
      // profile to create yet, so just bail out gracefully.
      return;
    }

    const guestSaved = [...savedItemIds];
    const newProfile: User = {
      id: user.id,
      name: fullName || 'Kumasi Buyer',
      username: username || email.split('@')[0],
      email: user.email || email,
      phone: '+233 24 550 4821',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      addresses: INITIAL_USER.addresses,
      joinedDate: `Joined ${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`,
      savedItemIds: guestSaved,
    };

    await supabase.from('profiles').upsert({
      id: newProfile.id,
      name: newProfile.name,
      username: newProfile.username,
      email: newProfile.email,
      phone: newProfile.phone,
      avatar: newProfile.avatar,
      addresses: newProfile.addresses,
      saved_item_ids: newProfile.savedItemIds,
      joined_date: newProfile.joinedDate,
    });
    setCurrentUser(newProfile);
    navigateAfterAuth();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const { user } = await signInWithEmailPassword(email, pass);
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (profile) {
        const remoteSaved: string[] = Array.isArray(profile.saved_item_ids) ? profile.saved_item_ids : [];
        const mergedSaved = Array.from(new Set([...remoteSaved, ...savedItemIds]));
        if (mergedSaved.length > remoteSaved.length) {
          await supabase.from('profiles').update({ saved_item_ids: mergedSaved }).eq('id', user.id);
        }
        setSavedItemIds(mergedSaved);
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          username: profile.username,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar,
          addresses: profile.addresses,
          joinedDate: profile.joined_date,
          savedItemIds: mergedSaved,
        });
      }
    } catch (e) {
      console.warn('Error reading user profile', e);
    }
    navigateAfterAuth();
  };

  const sendPasswordReset = async (email: string) => {
    await supabaseSendPasswordReset(email);
  };

  const signInWithGoogle = async () => {
    // Supabase OAuth redirects the browser away and back, so profile syncing
    // for the returning user happens in the onAuthStateChange listener above.
    await signInWithGoogleOAuth();
  };

  const logOutUser = async () => {
    await signOutUser();
    setSupabaseUser(null);
    setCurrentUser(GUEST_USER);
    goToScreen({ type: 'home' });
  };

  const activeProduct =
    screen.type === 'product_details'
      ? PRODUCTS.find((p) => p.id === screen.productId) || PRODUCTS[0]
      : null;

  const activeFarmId =
    screen.type === 'farmer_profile'
      ? screen.farmId
      : activeProduct
      ? activeProduct.farmId
      : null;

  const activeTraceCode =
    screen.type === 'traceability' ? screen.traceCode : null;

  const activeOrder =
    screen.type === 'order_success'
      ? orders.find((o) => o.id === screen.orderId) || orders[0]
      : screen.type === 'traceability' && screen.orderId
      ? orders.find((o) => o.id === screen.orderId) || null
      : null;

  return (
    <AppContext.Provider
      value={{
        screen,
        activeTab,
        cart,
        orders,
        currentUser,
        supabaseUser,
        authState: (supabaseUser ? 'authenticated' : 'guest') as AuthState,
        isAuthenticated: !!supabaseUser,
        isAuthLoading,
        selectedAddress,
        deliveryArea,
        searchQuery,
        selectedCategory,
        isQRScannerOpen,
        activeProduct,
        activeFarmId,
        activeTraceCode,
        activeOrder,
        cartCount,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        savedItemIds,
        isSaved,
        toggleSaveItem,
        goToScreen,
        requireAuth,
        setActiveTab,
        setDeliveryArea,
        setSearchQuery,
        setSelectedCategory,
        setSelectedAddress,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        viewProductDetails,
        viewFarmerProfile,
        viewTraceability,
        openQRScanner,
        closeQRScanner,
        addAddress,
        updateUser,
        startOnboarding,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signInWithGoogle,
        logOutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
