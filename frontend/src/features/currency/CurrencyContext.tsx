import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  rate: number; // multiplier against base INR
  label: string;
  name: string;
}

export const CURRENCY_RATES: Record<SupportedCurrency, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    rate: 1.0,
    label: 'INR (₹)',
    name: 'Indian Rupee',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    rate: 0.012, // approx ₹83.33 = $1
    label: 'USD ($)',
    name: 'US Dollar',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    rate: 0.011, // approx ₹90.91 = €1
    label: 'EUR (€)',
    name: 'Euro',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    rate: 0.0094, // approx ₹106.38 = £1
    label: 'GBP (£)',
    name: 'British Pound',
  },
};

const STORAGE_KEY = 'valley-currency';

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  formatPrice: (priceInINR: number) => string;
  convertPrice: (priceInINR: number) => number;
  currentSymbol: string;
  availableCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedCurrency;
      if (saved && CURRENCY_RATES[saved]) return saved;
    } catch {
      // ignore
    }
    return 'INR';
  });

  const setCurrency = useCallback((c: SupportedCurrency) => {
    if (!CURRENCY_RATES[c]) return;
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  }, []);

  const currentConfig = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;

  const convertPrice = useCallback(
    (priceInINR: number): number => {
      if (currency === 'INR') return priceInINR;
      return Math.round(priceInINR * currentConfig.rate);
    },
    [currency, currentConfig.rate]
  );

  const formatPrice = useCallback(
    (priceInINR: number): string => {
      if (currency === 'INR') {
        return '₹' + Math.round(priceInINR).toLocaleString('en-IN');
      }
      const converted = Math.round(priceInINR * currentConfig.rate);
      if (currency === 'USD') {
        return '$' + converted.toLocaleString('en-US');
      }
      if (currency === 'EUR') {
        return '€' + converted.toLocaleString('de-DE');
      }
      if (currency === 'GBP') {
        return '£' + converted.toLocaleString('en-GB');
      }
      return `${currentConfig.symbol}${converted}`;
    },
    [currency, currentConfig]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currentSymbol: currentConfig.symbol,
        availableCurrencies: Object.values(CURRENCY_RATES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};
