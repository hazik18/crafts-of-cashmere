import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Preloader } from '../components/Preloader';
import { COLLECTIONS } from '../types';
import { api } from '../services/api';

export const HomePage: React.FC = () => {
  const [showPreloader, setShowPreloader] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const heroMediaRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Hero entrance timeline
      const heroTl = gsap.timeline({ paused: true });
      gsap.set('.hero-line span', { yPercent: 110 });
      gsap.set(['.hero-eyebrow', '.hero-sub', '.hero-cta', '.hero-assure'], { y: 24, opacity: 0 });

      heroTl
        .to('.hero-line span', { yPercent: 0, duration: 1.4, stagger: 0.14, ease: 'power4.out' }, 0.1)
        .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.4)
        .to('.hero-ornament', { opacity: 1, duration: 1.2, ease: 'power3.out' }, 0.55)
        .to('.hero-sub', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.7)
        .to('.hero-cta', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.9)
        .to('.hero-assure', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 1.05);

      heroTl.from('.hero-media img', { scale: 1.14, duration: 2.6, ease: 'power2.out' }, 0);

      // Play after preloader
      const timer = setTimeout(() => {
        heroTl.play();
      }, 1000);

      // Parallax scrub on Hero
      gsap.to('.hero-media', {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to('.hero-content', {
        yPercent: -14,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: '75% top',
          scrub: true,
        },
      });

      // Section heads reveal
      document.querySelectorAll('.section-head').forEach((head) => {
        gsap.fromTo(
          head.querySelectorAll('.section-eyebrow, .section-title'),
          { opacity: 0, y: 44 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: head, start: 'top 82%' },
          }
        );
      });

      // Collections cards clip-path curtain reveal
      gsap.utils.toArray<HTMLElement>('.collection-card').forEach((card, i) => {
        const art = card.querySelector('.collection-art');
        const content = card.querySelectorAll('.collection-idx, .collection-name, .collection-desc');
        const tl = gsap.timeline({
          delay: (i % 2) * 0.16,
          scrollTrigger: { trigger: card, start: 'top 86%' },
        });

        tl.set(card, { opacity: 1 }, 0)
          .fromTo(
            art,
            { clipPath: 'inset(100% 0 0 0)', scale: 1.16, transformOrigin: '50% 100%' },
            { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.5, ease: 'power3.inOut' },
            0
          )
          .from(
            content,
            {
              opacity: 0,
              y: 26,
              duration: 0.9,
              stagger: 0.12,
              ease: 'power3.out',
              onComplete() {
                gsap.set(content, { clearProps: 'all' });
              },
            },
            0.65
          );
      });

      // Assurance fadeUp
      gsap.fromTo(
        ['.assurance-statement', '.assurance-item'],
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.assurance', start: 'top 82%' },
        }
      );

      // Newsletter fadeUp
      gsap.fromTo(
        '.newsletter-inner > *',
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.newsletter', start: 'top 82%' },
        }
      );

      // Marquee continuous translation
      if (marqueeTrackRef.current) {
        gsap.to(marqueeTrackRef.current, {
          xPercent: -50,
          ease: 'none',
          duration: 26,
          repeat: -1,
        });
      }

      return () => clearTimeout(timer);
    });

    return () => ctx.revert();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubscribing(true);
    try {
      await api.subscribe(newsletterEmail);
      setNewsletterDone(true);
    } catch {
      // Even if network error, display confirmation gracefully
      setNewsletterDone(true);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      <Navbar />

      <main id="top">
        {/* ============ HERO ============ */}
        <section className="hero" id="hero">
          <div ref={heroMediaRef} className="hero-media" aria-hidden="true">
            <img src="/images/hero.jpg" alt="" fetchPriority="high" />
          </div>
          <div className="blob blob-gold" aria-hidden="true" />
          <div className="blob blob-rose" aria-hidden="true" />
          <div className="hero-content">
            <p className="hero-eyebrow reveal-line">Handloom &amp; Handicrafts of Kashmir</p>
            <h1 className="hero-title">
              <span className="hero-line">
                <span>Woven in</span>
              </span>
              <span className="hero-line">
                <span>
                  <em>the Valley</em>
                </span>
              </span>
            </h1>
            <div className="hero-ornament" aria-hidden="true" />
            <p className="hero-sub reveal-line">
              Pashmina, kaani, walnut wood &amp; papier-mâché —<br />
              five centuries of craft, made by hand in Srinagar.
            </p>
            <Link to="/shop" className="hero-cta reveal-line">
              <span>Enter the Shop</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <p className="hero-assure reveal-line">
              100% Handmade&ensp;·&ensp;GI-Certified Authentic&ensp;·&ensp;Signed by its Maker
            </p>
          </div>
          <div className="hero-footer">
            <span>Est. traditions · 15th century</span>
            <span className="hero-scroll-hint">Scroll</span>
            <span>Srinagar, Jammu &amp; Kashmir</span>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <div className="marquee" aria-hidden="true">
          <div ref={marqueeTrackRef} className="marquee-track" id="marqueeTrack">
            <span>Pashmina</span>
            <i>·</i>
            <span className="mq-hl">100% Handmade</span>
            <i>·</i>
            <span>Kaani</span>
            <i>·</i>
            <span>Papier-Mâché</span>
            <i>·</i>
            <span className="mq-hl">GI-Certified Authentic</span>
            <i>·</i>
            <span>Walnut Carving</span>
            <i>·</i>
            <span>Hand-Knotted Carpets</span>
            <i>·</i>
            <span className="mq-hl">Signed by its Maker</span>
            <i>·</i>
            <span>Crewel Embroidery</span>
            <i>·</i>
            {/* Duplicated for seamless loop */}
            <span>Pashmina</span>
            <i>·</i>
            <span className="mq-hl">100% Handmade</span>
            <i>·</i>
            <span>Kaani</span>
            <i>·</i>
            <span>Papier-Mâché</span>
            <i>·</i>
            <span className="mq-hl">GI-Certified Authentic</span>
            <i>·</i>
            <span>Walnut Carving</span>
            <i>·</i>
            <span>Hand-Knotted Carpets</span>
            <i>·</i>
            <span className="mq-hl">Signed by its Maker</span>
            <i>·</i>
            <span>Crewel Embroidery</span>
            <i>·</i>
          </div>
        </div>

        {/* ============ COLLECTIONS ============ */}
        <section className="collections" id="collections">
          <div className="section-head">
            <p className="section-eyebrow">
              <span className="se-idx">01</span>
              <span className="se-label">Collections</span>
              <span className="se-meta">34.0837° N — 74.7973° E</span>
            </p>
            <h2 className="section-title">
              Six crafts,<br />
              <em>one valley.</em>
            </h2>
          </div>
          <div className="collection-grid" id="collectionGrid">
            {COLLECTIONS.map((c, i) => (
              <Link
                key={c.id}
                to={`/shop?cat=${c.id}`}
                className="collection-card"
                aria-label={`Shop ${c.name}`}
              >
                <span className="collection-idx">0{i + 1}</span>
                <div className="collection-art">
                  <img src={`/${c.img}`} alt={c.alt} loading="lazy" />
                </div>
                <h3 className="collection-name">{c.name}</h3>
                <p className="collection-desc">{c.desc}</p>
                <span className="collection-link">
                  Shop the craft
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ============ ASSURANCE ============ */}
        <section className="assurance" aria-label="Our assurances">
          <p className="assurance-statement">
            Nothing here is machine-made.<br />
            <em>Nothing ever will be.</em>
          </p>
          <div className="assurance-inner">
            <div className="assurance-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                aria-hidden="true"
              >
                <circle cx="12" cy="10" r="6" />
                <path d="M12 7v3l2 1.5" />
                <path d="M8.5 15.5 7 21l5-2.5L17 21l-1.5-5.5" />
              </svg>
              <h3>GI-Certified Authenticity</h3>
              <p>
                Every pashmina carries the Kashmir Geographical Indication mark — hand-tested for
                fibre, weave and origin.
              </p>
            </div>
            <div className="assurance-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                aria-hidden="true"
              >
                <rect x="4" y="5" width="16" height="14" rx="1" />
                <path d="M7 5v14M10 5v14M13 5v14M16 5v14M4 9.5h16M4 14.5h16" />
              </svg>
              <h3>Handmade, Start to Finish</h3>
              <p>
                Spun, woven, carved and painted entirely by hand in 42 family ateliers — every piece
                is signed by its maker.
              </p>
            </div>
            <div className="assurance-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
              </svg>
              <h3>Insured Worldwide Shipping</h3>
              <p>
                Complimentary, fully insured delivery to your door — wrapped in archival tissue,
                anywhere in the world.
              </p>
            </div>
          </div>
        </section>

        {/* ============ NEWSLETTER ============ */}
        <section className="newsletter">
          <div className="newsletter-inner">
            <h2 className="section-title">
              Letters from<br />
              <em>the valley.</em>
            </h2>
            <p>New arrivals, artisan stories and atelier notes. Once a month, never more.</p>
            {!newsletterDone ? (
              <form className="newsletter-form" id="newsletterForm" onSubmit={handleSubscribe}>
                <label className="visually-hidden" htmlFor="nlEmail">
                  Email address
                </label>
                <input
                  type="email"
                  id="nlEmail"
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={isSubscribing}>
                  {isSubscribing ? 'Joining…' : 'Subscribe'}
                </button>
              </form>
            ) : (
              <p className="newsletter-done" id="newsletterDone" style={{ display: 'block' }}>
                Thank you — see you in your inbox soon.
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};
