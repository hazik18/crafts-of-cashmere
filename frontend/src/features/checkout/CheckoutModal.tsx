import React, { useState } from 'react';
import { useCart } from '../cart/CartContext';
import { useCurrency } from '../currency/CurrencyContext';
import { api } from '../../services/api';
import { useToast } from '../../components/ToastContext';

export const CheckoutModal: React.FC = () => {
  const { cart, products, isCheckoutOpen, closeCheckout, clearCart, totalPrice } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await api.createOrder({
        name,
        email,
        address,
        items: cart.map((it) => ({ id: it.id, qty: it.qty })),
      });

      if (res.ok) {
        clearCart();
        setName('');
        setEmail('');
        setAddress('');
        closeCheckout();
        showToast(`Order ${res.orderId} placed — shukriya, we will write to you soon`);
      }
    } catch (err) {
      showToast((err as Error).message || 'Checkout failed — please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="co-overlay" id="coOverlay" onClick={closeCheckout} />
      <aside
        className="co-modal"
        id="coModal"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="co-head">
          <h3>Checkout</h3>
          <button
            className="co-close"
            id="coClose"
            aria-label="Close checkout"
            onClick={closeCheckout}
          >
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

        <form className="co-form" id="coForm" onSubmit={handleSubmit}>
          <label htmlFor="coName">Full name</label>
          <input
            id="coName"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            autoComplete="name"
          />

          <label htmlFor="coEmail">Email</label>
          <input
            id="coEmail"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={200}
            autoComplete="email"
          />

          <label htmlFor="coAddress">Delivery address</label>
          <textarea
            id="coAddress"
            name="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            maxLength={600}
            autoComplete="street-address"
          />

          <div className="co-summary" id="coSummary">
            {cart.map((it) => {
              const p = products.find((x) => x.id === it.id);
              if (!p) return null;
              return (
                <div key={it.id} className="co-line">
                  <span>
                    {it.qty}× {p.name}
                  </span>
                  <span>{formatPrice(p.price * it.qty)}</span>
                </div>
              );
            })}
            <div className="co-total">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {currency !== 'INR' && (
              <p className="co-currency-note">
                Equivalent to ₹{totalPrice.toLocaleString('en-IN')} INR
              </p>
            )}
          </div>

          <button
            type="submit"
            className="co-place"
            id="coPlace"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing Order…' : 'Place Order'}
          </button>
          <p className="co-note">
            Complimentary insured shipping · every piece GI-certified authentic
          </p>
        </form>
      </aside>
    </>
  );
};
