import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { Link } from 'react-router-dom';

export const ReturnsPage: React.FC = () => {
  return (
    <PolicyLayout
      idx="02"
      category="Returns & Guarantee"
      title="7-Day inspection & heirloom assurance."
      subtitle="We believe handling an authentic Kashmiri craft is a tactile, sensory dialogue. Experience your piece in your own natural light with complete peace of mind."
    >
      <div className="policy-grid">
        <div className="policy-card highlight">
          <div className="policy-badge">100% Purity Guarantee</div>
          <h3>Unconditional Authenticity Guarantee</h3>
          <p>
            If any pashmina, walnut carving, papier-mâché, or carpet purchased from Crafts of Cashmere is ever determined by an accredited textile or craft testing laboratory not to meet its certified GI specifications or stated artisan provenance, we provide an immediate <strong>100% refund</strong>, including all return shipping expenses.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h3>7-Day Consideration Window</h3>
          <p>
            You have seven full calendar days from the moment your package is marked delivered to inspect your piece. If the drape, palette, or proportions do not completely delight you, initiate a return effortlessly by contacting our concierge.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3>Condition for Return</h3>
          <p>
            Because each creation represents weeks or months on the loom, returned heirlooms must be in their original, unwashed, and unworn condition, with the intact artisan tag, GI seal, and presentation box.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="6" y1="12" x2="18" y2="12" />
            </svg>
          </div>
          <h3>Complimentary Pickups &amp; Fast Refunds</h3>
          <p>
            We schedule a safe courier pickup from your address (or provide an insured return dispatch label for international orders). Once returned to our Srinagar atelier and inspected by our master weavers, your refund is credited within <strong>3 to 5 business days</strong>.
          </p>
        </div>
      </div>

      <div className="policy-process">
        <h2 className="policy-section-heading">How to Initiate a Return</h2>
        <div className="policy-steps">
          <div className="policy-step">
            <span className="step-num">01</span>
            <h4>Notify Concierge</h4>
            <p>Email your order number to <a href="mailto:concierge@craftsofcashmere.com">concierge@craftsofcashmere.com</a> or message our WhatsApp concierge.</p>
          </div>
          <div className="policy-step">
            <span className="step-num">02</span>
            <h4>Secure Packing</h4>
            <p>Repack the piece in its original cedar box and archival wrapping to ensure full transit protection.</p>
          </div>
          <div className="policy-step">
            <span className="step-num">03</span>
            <h4>Doorstep Handover</h4>
            <p>Hand over to the designated insured carrier at your scheduled pickup slot.</p>
          </div>
          <div className="policy-step">
            <span className="step-num">04</span>
            <h4>Refund Settlement</h4>
            <p>Receive immediate written confirmation upon atelier receipt followed by full payment reversal.</p>
          </div>
        </div>
      </div>

      <div className="policy-banner-box">
        <h3>Have a question about sizing or bespoke commissions?</h3>
        <p>Bespoke commissions and personalized monogrammed pieces are woven specifically to your measurements and cannot be returned, but include lifetime repair support.</p>
        <Link to="/contact" className="policy-btn">Contact Concierge</Link>
      </div>
    </PolicyLayout>
  );
};

