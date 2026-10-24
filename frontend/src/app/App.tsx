import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from '../components/ToastContext';
import { CartProvider } from '../features/cart/CartContext';
import { CurrencyProvider } from '../features/currency/CurrencyContext';
import { WishlistProvider } from '../features/wishlist/WishlistContext';
import { Grain } from '../components/Grain';
import { ScrollProgress } from '../components/ScrollProgress';
import { CartDrawer } from '../features/cart/CartDrawer';
import { WishlistDrawer } from '../features/wishlist/WishlistDrawer';
import { CheckoutModal } from '../features/checkout/CheckoutModal';
import { HomePage } from '../pages/HomePage';
import { ShopPage } from '../pages/ShopPage';
import { CraftPage } from '../pages/CraftPage';
import { AdminPage } from '../pages/AdminPage';
import { useLenis } from '../hooks/useLenis';
import '../styles/style.css';

const ScrollToHash: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [hash]);

  return null;
};

const AppContent: React.FC = () => {
  const { pathname } = useLocation();

  // Lenis hijacks wheel/touch events on window, which breaks native scrolling
  // inside panels (e.g. the admin editor drawer). The admin dashboard doesn't
  // use scroll animations, so keep smooth scrolling to the storefront only.
  useLenis(!pathname.startsWith('/admin'));

  return (
    <>
      <ScrollToHash />
      {!pathname.startsWith('/admin') && <Grain />}
      <ScrollProgress />
      <WishlistDrawer />
      <CartDrawer />
      <CheckoutModal />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/craft" element={<CraftPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CurrencyProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </CurrencyProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

