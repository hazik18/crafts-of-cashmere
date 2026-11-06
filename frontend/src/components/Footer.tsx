import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-top">
        {/* Left Column: Brand Identity, Story, Badges & Atelier Contact */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">Crafts of Cashmere</Link>
          <span className="footer-tagline">Atelier Srinagar · Kashmir</span>
          <p className="footer-brand-desc">
            Preserving five centuries of authentic Kashmiri mastercraft. Every pashmina,
            kaani weave, and walnut wood heirloom is handwoven in our valley ateliers,
            GI-certified, and signed by its master artisan.
          </p>

          <div className="footer-badges">
            <span className="footer-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              GI-Certified Authentic
            </span>
            <span className="footer-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              100% Handloom
            </span>
            <span className="footer-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Fair-Trade Ateliers
            </span>
          </div>

          <div className="footer-atelier-contact">
            <span className="footer-atelier-city">Old City, Shehr-e-Khaas, Srinagar 190002</span>
            <a href="mailto:concierge@craftsofcashmere.com" className="footer-atelier-email">
              concierge@craftsofcashmere.com
            </a>
          </div>
        </div>

        {/* Right Navigation Columns: Balanced 3-Column Grid */}
        <div className="footer-nav-grid">
          <div className="footer-col">
            <h3>Shop by Craft</h3>
            <Link to="/shop?cat=pashmina">Pashmina &amp; Cashmere</Link>
            <Link to="/shop?cat=kaani">Kaani Shawls</Link>
            <Link to="/shop?cat=walnut">Walnut Wood Carving</Link>
            <Link to="/shop?cat=carpet">Hand-knotted Carpets</Link>
            <Link to="/shop?cat=papier">Papier-Mâché Art</Link>
            <Link to="/shop?cat=crewel">Crewel &amp; Namda Rugs</Link>
          </div>

          <div className="footer-col">
            <h3>The House</h3>
            <Link to="/craft">The Craft Heritage</Link>
            <Link to="/craft#atelier">Valley Ateliers</Link>
            <Link to="/#collections">Curated Collections</Link>
            <Link to="/craft">Master Artisans</Link>
            <Link to="/authenticity">GI Heritage Index</Link>
          </div>

          <div className="footer-col">
            <h3>Care &amp; Trust</h3>
            <Link to="/shipping">Shipping &amp; Worldwide Delivery</Link>
            <Link to="/returns">Returns &amp; Guarantee</Link>
            <Link to="/authenticity">GI Authenticity Certificate</Link>
            <Link to="/contact">Atelier Concierge &amp; Contact</Link>
            <Link to="/admin">Atelier Admin</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-info">
          <span>© 2026 Crafts of Cashmere · Handcrafted in the valley of Kashmir</span>
          <span className="footer-bottom-sep">·</span>
          <span className="footer-legal-links">
            <Link to="/shipping">Shipping Policy</Link>
            <span className="footer-bottom-sep">·</span>
            <Link to="/returns">Returns Policy</Link>
            <span className="footer-bottom-sep">·</span>
            <Link to="/authenticity">Authenticity Charter</Link>
          </span>
        </div>
        <div className="footer-bottom-meta">
          <span>GI-Registered Artisans</span>
          <span className="footer-bottom-sep">·</span>
          <span>Worldwide Insured Shipping</span>
        </div>
      </div>
    </footer>
  );
};
