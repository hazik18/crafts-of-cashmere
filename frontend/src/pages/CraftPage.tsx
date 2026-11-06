import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const CraftPage: React.FC = () => {
  const interludeImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.classList.add('subpage');
    return () => {
      document.body.classList.remove('subpage');
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(['.craft-row', '.atelier-motif', '.atelier-credit', '.atelier-body', '.q-line'], {
        opacity: 1,
        y: 0,
        yPercent: 0,
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Craft rows fade up
      gsap.fromTo(
        '.craft-row',
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.craft-rows', start: 'top 82%' },
        }
      );

      // Numbers & stats
      document.querySelectorAll('.craft-stat strong').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });

      // Interlude image reveal and parallax
      if (interludeImgRef.current) {
        gsap.fromTo(
          interludeImgRef.current,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.4,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: '.interlude', start: 'top 86%' },
          }
        );

        gsap.fromTo(
          interludeImgRef.current,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: '.interlude',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }

      // Atelier quote reveals
      gsap.fromTo(
        ['.atelier-motif', '.atelier-credit', '.atelier-body'],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.atelier', start: 'top 82%' },
        }
      );

      gsap.fromTo(
        '.q-line',
        { yPercent: 100, opacity: 1 },
        {
          yPercent: 0,
          duration: 1.3,
          stagger: 0.18,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.atelier-quote', start: 'top 80%' },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Navbar solid={true} />

      <main id="top">
        {/* ============ CRAFT STORY ============ */}
        <section className="craft" id="craft">
          <div className="section-head page-head">
            <p className="section-eyebrow">
              <span className="se-idx">01</span>
              <span className="se-label">The Craft</span>
              <span className="se-meta">Process — 03 stages</span>
            </p>
            <h2 className="section-title">
              Slow by<br />
              <em>design.</em>
            </h2>
          </div>

          <div className="craft-rows">
            <div className="craft-row">
              <div className="craft-num">01</div>
              <div className="craft-text">
                <h3>The fibre</h3>
                <p>
                  True pashmina begins 14,000 feet up, in the undercoat of the Changthangi goat. Each
                  animal yields barely 80 grams a year — combed, never sheared, every spring.
                </p>
              </div>
              <div className="craft-stat">
                <strong>14–16µ</strong>
                <span>fibre fineness</span>
              </div>
            </div>

            <div className="craft-row">
              <div className="craft-num">02</div>
              <div className="craft-text">
                <h3>The loom</h3>
                <p>
                  Hand-spun on the yinder wheel and woven on wooden looms unchanged for generations. A
                  kaani shawl grows a few centimetres a day, following a coded pattern called the
                  talim.
                </p>
              </div>
              <div className="craft-stat">
                <strong>18 mo</strong>
                <span>for one kaani shawl</span>
              </div>
            </div>

            <div className="craft-row">
              <div className="craft-num">03</div>
              <div className="craft-text">
                <h3>The hand</h3>
                <p>
                  Walnut carved with hand chisels, papier-mâché painted with squirrel-hair brushes,
                  carpets knotted one thread at a time. No two pieces are ever the same — by
                  intention.
                </p>
              </div>
              <div className="craft-stat">
                <strong>900+</strong>
                <span>knots per sq. inch</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============ INTERLUDE ============ */}
        <section className="interlude">
          <img
            ref={interludeImgRef}
            src="/images/dal-lake.jpg"
            alt="Wooden houseboat on Dal Lake beneath snow-covered mountains, Srinagar"
            loading="lazy"
          />
          <p className="interlude-caption">Dal Lake, Srinagar — where every piece begins</p>
        </section>

        {/* ============ QUOTE / ATELIER ============ */}
        <section className="atelier" id="atelier">
          <div className="blob blob-atelier" aria-hidden="true" />
          <svg className="atelier-paisley" viewBox="0 0 300 400" aria-hidden="true">
            <path
              d="M150 70 C215 105 225 195 178 255 C150 290 105 285 92 250 C80 216 102 182 135 188 C158 192 168 216 152 232"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>
          <div className="atelier-inner">
            <svg className="atelier-motif" viewBox="0 0 100 100" aria-hidden="true">
              <path
                d="M50 8 C74 22 78 52 60 70 C50 80 36 78 32 66 C28 55 36 44 47 46 C54 47 57 55 52 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            <blockquote className="atelier-quote">
              <span className="q-line">“Every shawl remembers</span>
              <span className="q-line">the hands that made it.”</span>
            </blockquote>
            <p className="atelier-credit">
              — Ghulam Nabi, master weaver, fourth generation · Kanihama village
            </p>
            <p className="atelier-body">
              We work directly with 42 artisan families across the valley. Every piece carries the
              name of its maker, and every purchase returns to the workshop that made it.
            </p>
            <Link to="/shop" className="atelier-cta">
              <span>Shop their work</span>
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
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};
