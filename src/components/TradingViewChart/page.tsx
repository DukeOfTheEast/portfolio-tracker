// components/TradingViewChart.tsx
import React, { useEffect, useRef, useState } from "react";

interface TradingViewChartProps {
  defaultSymbol?: string;
  theme?: "light" | "dark";
  height?: number;
}

interface CryptoPair {
  id: string;
  symbol: string;
  name: string;
}

// Minimal type for CoinGecko /coins/markets response
interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  // Add more fields if needed (e.g., image, market_cap)
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  defaultSymbol = "BTCUSD",
  theme = "light",
  height = 500,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cryptoPairs, setCryptoPairs] = useState<CryptoPair[]>([]);

  useEffect(() => {
    async function fetchCryptoPairs() {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
        );
        const coins = await response.json();
        const pairs = coins.map((coin: CoinGeckoCoin) => ({
          id: coin.id,
          symbol: `${coin.symbol.toUpperCase()}USD`,
          name: `${coin.name} / US Dollar`,
        }));
        setCryptoPairs(pairs);
      } catch (error) {
        console.error("Error fetching coins:", error);
        setCryptoPairs([]);
      }
    }

    fetchCryptoPairs();
  }, []);

  // Filter pairs based on search query
  const filteredPairs = cryptoPairs.filter(
    (pair) =>
      pair.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Check if TradingView widget script is already loaded
    const scriptExists = document.getElementById("tradingview-widget-script");

    if (!scriptExists) {
      const script = document.createElement("script");
      script.id = "tradingview-widget-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        loadChart();
      };
    } else {
      loadChart();
    }

    return () => {
      // Clean up if needed
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [selectedSymbol, theme]);

  const loadChart = () => {
    if (container.current && window.TradingView) {
      container.current.innerHTML = "";
      new window.TradingView.widget({
        width: "100%",
        height: height,
        symbol: `BINANCE:${selectedSymbol}`,
        interval: "D",
        timezone: "Etc/UTC",
        theme: theme,
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: container.current.id,
      });
    }
  };

  const handleSelectPair = (symbol: string) => {
    setSelectedSymbol(symbol);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="w-full border border-gray-200 rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold mb-2 sm:mb-0">
            TradingView Chart
          </h2>

          <div className="relative w-full sm:w-64">
            <div
              className="p-2 border border-gray-300 rounded-md flex justify-between items-center cursor-pointer"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <span className="text-sm font-medium">
                {cryptoPairs.find((p) => p.symbol === selectedSymbol)?.name ||
                  selectedSymbol}
              </span>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isSearchOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search pairs..."
                    className="w-full p-2 text-sm border border-gray-300 rounded-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredPairs.map((pair) => (
                    <div
                      key={pair.id}
                      className={`p-2 text-sm cursor-pointer hover:bg-gray-100 ${
                        selectedSymbol === pair.symbol ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleSelectPair(pair.symbol)}
                    >
                      <div className="font-medium">{pair.name}</div>
                      <div className="text-xs text-gray-500">{pair.symbol}</div>
                    </div>
                  ))}
                  {filteredPairs.length === 0 && (
                    <div className="p-2 text-sm text-gray-500">
                      No pairs found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        id="tradingview-chart-container"
        ref={container}
        className="w-full"
      ></div>
    </div>
  );
};

// Add type definitions for the TradingView widget
declare global {
  interface Window {
    TradingView: {
      widget: new (
        config: TradingViewWidgetConfig
      ) => TradingViewWidgetInstance;
    };
  }
}

interface TradingViewWidgetInstance {
  options: TradingViewWidgetConfig;
  iframe: HTMLIFrameElement;
  remove(): void;
}

interface TradingViewWidgetConfig {
  width?: string | number;
  height?: number;
  symbol: string;
  interval?: string;
  timezone?: string;
  theme?: "light" | "dark";
  style?: string | number;
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id: string;
}

export default TradingViewChart;
