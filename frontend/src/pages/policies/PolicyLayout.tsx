import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

interface PolicyLayoutProps {
  idx: string;
  category: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  idx,
  category,
  title,
  subtitle,
  children,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('subpage');
    return () => {
      document.body.classList.remove('subpage');
    };
  }, []);

  return (
    <>
      <Navbar solid={true} />

      <main className="policy-page" id="top">
        {/* Header section */}
        <section className="section-head page-head policy-head">
          <p className="section-eyebrow">
            <span className="se-idx">{idx}</span>
            <span className="se-label">{category}</span>
            <span className="se-meta">Patron Trust &amp; Care</span>
          </p>
          <h1 className="section-title policy-title">
            {title}
          </h1>
          <p className="policy-subtitle">{subtitle}</p>

          {/* Quick Sub-navigation Bar */}
          <nav className="policy-nav-tabs" aria-label="Policy and Care navigation">
            <NavLink
              to="/shipping"
              className={({ isActive }) => `policy-tab${isActive ? ' active' : ''}`}
            >
              Shipping &amp; Delivery
            </NavLink>
            <NavLink
              to="/returns"
              className={({ isActive }) => `policy-tab${isActive ? ' active' : ''}`}
            >
              Returns &amp; Guarantee
            </NavLink>
            <NavLink
              to="/authenticity"
              className={({ isActive }) => `policy-tab${isActive ? ' active' : ''}`}
            >
              GI Authenticity
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => `policy-tab${isActive ? ' active' : ''}`}
            >
              Contact &amp; Atelier
            </NavLink>
          </nav>
        </section>

        {/* Policy Body */}
        <div className="policy-content">
          {children}
        </div>
      </main>

      <Footer />
    </>
  );
};

