import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product, Catalog } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ToastContext';

export const formatINR = (n: number): string => '₹' + n.toLocaleString('en-IN');

interface CartContextType {
  cart: CartItem[];
  catalog: Catalog | null;
  products: Product[];
  isLoadingCatalog: boolean;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  totalItems: number;
  totalPrice: number;
  refreshCatalog: () => Promise<void>;
}

const CART_KEY = 'valley-cart';

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const { showToast } = useToast();

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await api.getCatalog();
      if (res && res.catalog) {
        setCatalog(res.catalog);
        const allProducts = Object.values(res.catalog).flatMap((c) => c.items);
        setProducts(allProducts);

        // Prune cart of any obsolete IDs
        setCart((prev) => {
          const valid = prev.filter((item) => allProducts.some((p) => p.id === item.id));
          localStorage.setItem(CART_KEY, JSON.stringify(valid));
          return valid;
        });
      }
    } catch (err) {
      console.warn('Could not fetch catalog from API, waiting for backend...', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  const saveCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  };

  const addToCart = useCallback(
    (id: string) => {
      const p = products.find((x) => x.id === id);
      if (!p) return;

      setCart((prev) => {
        const existing = prev.find((x) => x.id === id);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
        } else {
          updated = [...prev, { id, qty: 1 }];
        }
        localStorage.setItem(CART_KEY, JSON.stringify(updated));
        return updated;
      });

      showToast(`${p.name} added to cart`);
    },
    [products, showToast]
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const updated = prev.filter((x) => x.id !== id);
      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((x) => {
          if (x.id === id) {
            const newQty = x.qty + delta;
            return newQty > 0 ? { ...x, qty: newQty } : null;
          }
          return x;
        })
        .filter(Boolean) as CartItem[];

      localStorage.setItem(CART_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    saveCart([]);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    document.body.classList.add('cart-open');
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    document.body.classList.remove('cart-open');
  }, []);

  const openCheckout = useCallback(() => {
    closeCart();
    setIsCheckoutOpen(true);
    document.body.classList.add('co-open');
  }, [closeCart]);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    document.body.classList.remove('co-open');
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const totalPrice = cart.reduce((sum, item) => {
    const p = products.find((x) => x.id === item.id);
    return sum + item.qty * (p?.price || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        catalog,
        products,
        isLoadingCatalog,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        totalItems,
        totalPrice,
        refreshCatalog,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
