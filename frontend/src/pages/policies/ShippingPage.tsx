import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { Link } from 'react-router-dom';

export const ShippingPage: React.FC = () => {
  return (
    <PolicyLayout
      idx="01"
      category="Shipping & Delivery"
      title="Insured global delivery from Kashmir."
      subtitle="Every heirloom piece leaves our Srinagar atelier fully insured, climate-sealed, and tracked directly to your residence worldwide."
    >
      <div className="policy-grid">
        <div className="policy-card highlight">
          <div className="policy-badge">Complimentary Courier</div>
          <h3>Doorstep Transit Guarantee</h3>
          <p>
            We partner exclusively with premium express carriers — <strong>DHL Express</strong>, <strong>FedEx International Priority</strong>, and <strong>Blue Dart Apex</strong>. Every parcel is insured for 100% of its declared value from the moment it leaves the valley of Kashmir until signature confirmation at your door.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <h3>Transit Timelines</h3>
          <ul className="policy-list">
            <li>
              <strong>Domestic (India):</strong> 3 to 5 business days via air freight.
            </li>
            <li>
              <strong>North America &amp; Europe:</strong> 6 to 10 business days via DHL Express Priority.
            </li>
            <li>
              <strong>Middle East &amp; Singapore:</strong> 5 to 8 business days.
            </li>
            <li>
              <strong>Rest of the World:</strong> 8 to 14 business days depending on national customs processing.
            </li>
          </ul>
        </div>

        <div className="policy-card">
          <div className="policy-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3>Archival Packaging</h3>
          <p>
            Pashmina and silk tapestries require breathable archival handling. Your pieces arrive wrapped in acid-free butter paper, tied with mulberry silk ribbons, placed in an embossed cedar-scented keepsake presentation box, and accompanied by the signed artisan certificate of provenance.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3>Customs, Duties &amp; Taxes</h3>
          <p>
            Domestic shipments across India include all applicable GST. For international orders, shipments are delivered under standard Delivered At Place (DAP) terms. Because our goods carry official <strong>Government GI Origin Certificates</strong>, many destinations qualify for preferential artisanal textile tariffs.
          </p>
        </div>
      </div>

      <div className="policy-faq">
        <h2 className="policy-section-heading">Frequently Asked Questions</h2>
        <div className="policy-faq-item">
          <h4>Can I track my consignment in real time?</h4>
          <p>
            Yes. As soon as your order completes final hand-inspection and leaves Srinagar, you will receive an SMS, WhatsApp update, and email with your direct DHL/FedEx tracking link.
          </p>
        </div>
        <div className="policy-faq-item">
          <h4>Are pieces made to order?</h4>
          <p>
            Catalog pieces indicated as in-stock ship within 24 to 48 hours. Pieces woven or carved to order (such as master Kaani shawls or custom walnut chests) indicate their specific crafting lead time on their product page (typically 2 to 6 weeks).
          </p>
        </div>
        <div className="policy-faq-item">
          <h4>Need urgent delivery for a special wedding or gifting date?</h4>
          <p>
            Please write directly to our Srinagar concierge at <a href="mailto:concierge@craftsofcashmere.com">concierge@craftsofcashmere.com</a> or visit our <Link to="/contact">Contact Page</Link> for white-glove expedited dispatch.
          </p>
        </div>
      </div>
    </PolicyLayout>
  );
};

