import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { Link } from 'react-router-dom';

export const AuthenticityPage: React.FC = () => {
  return (
    <PolicyLayout
      idx="03"
      category="GI Authenticity"
      title="The mark of origin & artisanal integrity."
      subtitle="How we safeguard five centuries of Kashmiri craft heritage against synthetic replicas, power-loom counterfeits, and machine imitation."
    >
      <div className="policy-story-block">
        <div className="policy-story-text">
          <span className="policy-pill">Official Geographical Indication</span>
          <h2>The true definition of Kashmiri Pashmina</h2>
          <p>
            Under the <em>Geographical Indications of Goods (Registration &amp; Protection) Act</em>, authentic Kashmiri Pashmina is legally protected worldwide. To qualify for official GI certification:
          </p>
          <ul className="policy-list checkmarks">
            <li>
              <strong>Source:</strong> The raw fleece must originate exclusively from the *Capra Hircus* (Changthangi goat), reared by semi-nomadic Changpa tribes in Ladakh at altitudes exceeding 14,000 feet.
            </li>
            <li>
              <strong>Fineness:</strong> The microscopic fibre diameter must measure between <strong>12 to 15.5 microns</strong> (six times finer than human hair).
            </li>
            <li>
              <strong>Spinning:</strong> Spun entirely by hand on the traditional wooden spinning wheel (*Yinder*) by Kashmiri women artisans in rural villages.
            </li>
            <li>
              <strong>Weaving:</strong> Woven exclusively on handlooms by master artisans (*Wafabaf*) without motorized power or chemical resizing.
            </li>
          </ul>
        </div>
        <div className="policy-seal-card">
          <div className="gi-seal-graphic">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <h4>Government GI Certified</h4>
          <p className="seal-desc">Tested &amp; laser-tagged by the Craft Development Institute (CDI), Srinagar.</p>
          <div className="seal-stats">
            <div>
              <span className="stat-number">12-15μ</span>
              <span className="stat-label">Micron Diameter</span>
            </div>
            <div>
              <span className="stat-number">100%</span>
              <span className="stat-label">Hand-Spun &amp; Woven</span>
            </div>
          </div>
        </div>
      </div>

      <div className="policy-grid three-col">
        <div className="policy-card">
          <div className="policy-badge">Purity Testing</div>
          <h3>Microscopic &amp; DNA Analysis</h3>
          <p>
            Folklore tests like the &ldquo;ring test&rdquo; are easily duped by synthetic viscose and polyester microfibres. We submit our raw fleece and completed textiles to state-of-the-art optical fibre diameter analyzers (OFDA) to verify zero synthetic contamination.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-badge">Maker Provenance</div>
          <h3>The Artisan's Direct Mark</h3>
          <p>
            Unlike mass-market aggregators who obscure the artisan, every single piece in our collection carries the specific name, village atelier, and lineage of the master weaver, woodcarver, or papier-mâché artist who crafted it.
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-badge">Fair Trade Alliance</div>
          <h3>Direct Living Wages</h3>
          <p>
            By eliminating multiple layers of intermediaries, over 65% of the retail value goes directly to the artisan households. This economic stability allows age-old techniques like Kaani needle-weaving and intricate walnut jali carving to thrive into the next generation.
          </p>
        </div>
      </div>

      <div className="policy-cta-card">
        <h3>Explore the stories behind our six Kashmiri crafts</h3>
        <p>From the wooden looms of Srinagar to the walnut groves of Baramulla, learn how our artisans bring centuries of heritage into every piece.</p>
        <div className="policy-cta-links">
          <Link to="/craft" className="policy-btn primary">Discover The Craft</Link>
          <Link to="/shop" className="policy-btn secondary">Browse Certified Heirlooms</Link>
        </div>
      </div>
    </PolicyLayout>
  );
};

