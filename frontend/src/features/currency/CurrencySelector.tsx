import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, SupportedCurrency } from './CurrencyContext';

interface CurrencySelectorProps {
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className = '' }) => {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeConfig = availableCurrencies.find((c) => c.code === currency) || availableCurrencies[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedCurrency) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`currency-selector ${className}`}>
      <button
        type="button"
        className={`currency-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Currency: ${activeConfig.name} (${activeConfig.code})`}
      >
        <span className="currency-code">{activeConfig.code}</span>
        <span className="currency-symbol">{activeConfig.symbol}</span>
        <svg
          className={`currency-chevron ${isOpen ? 'open' : ''}`}
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="currency-menu" role="listbox" aria-label="Select Currency">
          {availableCurrencies.map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`currency-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(c.code)}
              >
                <span className="currency-opt-symbol">{c.symbol}</span>
                <span className="currency-opt-code">{c.code}</span>
                <span className="currency-opt-name">{c.name}</span>
                {isSelected && (
                  <svg
                    className="currency-opt-check"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
