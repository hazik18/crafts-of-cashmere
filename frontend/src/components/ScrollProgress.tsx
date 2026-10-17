import React, { useEffect, useState } from 'react';

export const ScrollProgress: React.FC = () => {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScale(max > 0 ? window.scrollY / max : 0);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="scroll-progress"
      id="scrollProgress"
      aria-hidden="true"
      style={{ transform: `scaleX(${scale})` }}
    />
  );
};
