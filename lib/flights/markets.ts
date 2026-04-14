import type { CurrencyCode, Market } from "@/lib/flights/types";

export interface MarketConfig {
  value: Market;
  label: string;
  locale: string;
  skyscannerMarket: string;
  defaultCurrency: CurrencyCode;
}

export const MARKET_CONFIG: Record<Market, MarketConfig> = {
  US: {
    value: "US",
    label: "United States",
    locale: "en-US",
    skyscannerMarket: "US",
    defaultCurrency: "USD"
  },
  DE: {
    value: "DE",
    label: "Germany",
    locale: "de-DE",
    skyscannerMarket: "DE",
    defaultCurrency: "EUR"
  },
  GB: {
    value: "GB",
    label: "United Kingdom",
    locale: "en-GB",
    skyscannerMarket: "UK",
    defaultCurrency: "GBP"
  },
  IN: {
    value: "IN",
    label: "India",
    locale: "en-IN",
    skyscannerMarket: "IN",
    defaultCurrency: "USD"
  }
};

export const MARKET_COMPARE_ORDER: Market[] = ["US", "DE", "GB", "IN"];

export function getMarketLabel(market: Market) {
  return MARKET_CONFIG[market].label;
}

export function getSkyscannerMarketConfig(market: Market) {
  return MARKET_CONFIG[market];
}
