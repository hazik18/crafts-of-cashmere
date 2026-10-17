import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '../../components/ToastContext';
import { useCart } from '../cart/CartContext';

interface WishlistContextType {
  wishlist: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  wishlistCount: number;
}

const WISHLIST_KEY = 'valley-wishlist';

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { showToast } = useToast();
  const { products } = useCart();

  const saveWishlist = useCallback((ids: string[]) => {
    setWishlist(ids);
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, []);

  // Prune obsolete IDs when products catalog loads
  useEffect(() => {
    if (products.length > 0) {
      setWishlist((prev) => {
        const valid = prev.filter((id) => products.some((p) => p.id === id));
        if (valid.length !== prev.length) {
          saveWishlist(valid);
        }
        return valid;
      });
    }
  }, [products, saveWishlist]);

  const isWishlisted = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist]
  );

  const addToWishlist = useCallback(
    (id: string) => {
      if (wishlist.includes(id)) return;
      const updated = [...wishlist, id];
      saveWishlist(updated);
      const product = products.find((p) => p.id === id);
      showToast(product ? `Saved “${product.name}” to heirlooms` : 'Saved to heirlooms');
    },
    [wishlist, products, saveWishlist, showToast]
  );

  const removeFromWishlist = useCallback(
    (id: string) => {
      const updated = wishlist.filter((item) => item !== id);
      saveWishlist(updated);
      const product = products.find((p) => p.id === id);
      showToast(product ? `Removed “${product.name}” from heirlooms` : 'Removed from heirlooms');
    },
    [wishlist, products, saveWishlist, showToast]
  );

  const toggleWishlist = useCallback(
    (id: string) => {
      if (wishlist.includes(id)) {
        removeFromWishlist(id);
      } else {
        addToWishlist(id);
      }
    },
    [wishlist, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(() => {
    saveWishlist([]);
    showToast('Heirloom wishlist cleared');
  }, [saveWishlist, showToast]);

  const openWishlist = useCallback(() => {
    setIsWishlistOpen(true);
    document.body.classList.add('wishlist-open');
  }, []);

  const closeWishlist = useCallback(() => {
    setIsWishlistOpen(false);
    document.body.classList.remove('wishlist-open');
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isWishlisted,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
};
