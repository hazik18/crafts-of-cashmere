import React, { useEffect } from 'react';
import { useCart } from './CartContext';
import { useCurrency } from '../currency/CurrencyContext';
import { CraftMotif } from '../products/Motif';
import { useToast } from '../../components/ToastContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    products,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart,
    totalPrice,
  } = useCart();

  const { formatPrice, currency } = useCurrency();
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  return (
    <>
      <div
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`}
        id="cartOverlay"
        onClick={closeCart}
      />

      <aside className="cart-drawer" id="cartDrawer" aria-label="Shopping cart" data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
        <div className="cart-head">
          <h3>Your Cart</h3>
          <button className="cart-close" id="cartClose" aria-label="Close cart" onClick={closeCart}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="cart-items" id="cartItems">
          {cart.length === 0 ? (
            <p className="cart-empty">Your cart is empty —<br />the looms are waiting.</p>
          ) : (
            cart.map((item) => {
              const p = products.find((x) => x.id === item.id);
              if (!p) return null;

              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-thumb">
                    {p.img ? (
                      <img src={`/${p.img}`} alt={p.alt || p.name} />
                    ) : (
                      <CraftMotif
                        motif={p.motif || 'paisley'}
                        paletteKey={p.cat}
                        uid={`cart-${p.id}`}
                      />
                    )}
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-name">{p.name}</p>
                    <p className="cart-item-price">{formatPrice(p.price)}</p>
                    <div className="cart-qty">
                      <button
                        onClick={() => updateQuantity(p.id, -1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => updateQuantity(p.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="cart-remove"
                    onClick={() => removeFromCart(p.id)}
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-foot">
          <div className="cart-total">
            <span>Subtotal</span>
            <strong id="cartTotal">{formatPrice(totalPrice)}</strong>
          </div>
          {currency !== 'INR' && (
            <p className="cart-currency-note">
              Approximate conversion · Billed in ₹{totalPrice.toLocaleString('en-IN')} INR
            </p>
          )}
          <button
            className="cart-checkout"
            id="cartCheckout"
            onClick={() => {
              if (cart.length === 0) {
                showToast('Your cart is empty');
                return;
              }
              openCheckout();
            }}
          >
            Proceed to Checkout
          </button>
          <p className="cart-note">Complimentary insured shipping worldwide</p>
        </div>
      </aside>
    </>
  );
};
