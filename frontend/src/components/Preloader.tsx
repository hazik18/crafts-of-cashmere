import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDone(true);
      if (onComplete) onComplete();
    }, 900);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`preloader ${isDone ? 'done' : ''}`} id="preloader">
      <div className="preloader-inner">
        <span className="preloader-word">Crafts of Cashmere</span>
        <span className="preloader-sub">Srinagar · Est. traditions 15th century</span>
      </div>
    </div>
  );
};
