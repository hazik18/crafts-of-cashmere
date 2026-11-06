import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      prevent: (node) => {
        if (!node) return false;
        const el = node as HTMLElement;
        return (
          el.hasAttribute?.('data-lenis-prevent') ||
          Boolean(el.closest?.('[data-lenis-prevent]')) ||
          Boolean(el.closest?.('.pd-modal')) ||
          Boolean(el.closest?.('.pd-info')) ||
          Boolean(el.closest?.('.co-modal')) ||
          Boolean(el.closest?.('.cart-drawer')) ||
          Boolean(el.closest?.('.wishlist-drawer'))
        );
      },
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Pause Lenis whenever a modal or drawer is active so the background cannot scroll
    const checkModalOpen = () => {
      const isModalOpen =
        document.body.classList.contains('pd-open') ||
        document.body.classList.contains('co-open') ||
        document.body.classList.contains('cart-open') ||
        document.body.classList.contains('wishlist-open');
      if (isModalOpen) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    checkModalOpen();

    const observer = new MutationObserver(checkModalOpen);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [enabled]);
}
