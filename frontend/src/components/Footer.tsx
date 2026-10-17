import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <span className="footer-logo">Crafts of Cashmere</span>
        <div className="footer-cols">
          <div>
            <h4>Shop</h4>
            <Link to="/shop?cat=pashmina">Pashmina</Link>
            <Link to="/shop?cat=kaani">Kaani</Link>
            <Link to="/shop?cat=walnut">Wood Carving</Link>
            <Link to="/shop?cat=carpet">Carpets</Link>
          </div>
          <div>
            <h4>House</h4>
            <Link to="/craft">The Craft</Link>
            <Link to="/craft#atelier">Atelier</Link>
            <Link to="/#collections">Collections</Link>
          </div>
          <div>
            <h4>Care</h4>
            <a href="#shipping" onClick={(e) => e.preventDefault()}>
              Shipping
            </a>
            <a href="#returns" onClick={(e) => e.preventDefault()}>
              Returns
            </a>
            <a href="#authenticity" onClick={(e) => e.preventDefault()}>
              Authenticity
            </a>
            <Link to="/admin">Atelier Admin</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Crafts of Cashmere · Handcrafted in the valley of Kashmir</span>
        <span>GI-certified pashmina · Fair-trade ateliers</span>
      </div>
    </footer>
  );
};
