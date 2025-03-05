// components/SearchBar.tsx
import { useState, FormEvent } from "react";
import { Coin } from "@/types/crypto";
import CoinList from "@/components/CoinList/page";

interface CoinGeckoCoin {
  id: string;
  name: string;
  symbol: string;
  api_symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
  contract_address?: string;
}

interface CoinGeckoResponse {
  coins: CoinGeckoCoin[];
}

interface CoinMarketData {
  id: string;
  current_price: number;
  price_change_24h: number; // Included from your example, though not used yet
}

interface SearchBarProps {
  onCoinClick: (coin: Coin) => void;
}

export default function SearchBar({ onCoinClick }: SearchBarProps) {
  const [query, setQuery] = useState<string>("");
  const [localResults, setLocalResults] = useState<Coin[]>([]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query) {
      setLocalResults([]);

      return;
    }

    try {
      // Step 1: Fetch search results
      const searchResponse = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}`
      );
      if (!searchResponse.ok) {
        throw new Error(`Search HTTP error! status: ${searchResponse.status}`);
      }
      const searchData: CoinGeckoResponse = await searchResponse.json();
      console.log("Search API Response:", searchData);

      // Extract coin IDs
      const coinIds = searchData.coins.map((coin) => coin.id).join(",");
      if (!coinIds) {
        setLocalResults([]);

        return;
      }

      // Step 2: Fetch price data
      const marketResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
      );
      if (!marketResponse.ok) {
        throw new Error(`Market HTTP error! status: ${marketResponse.status}`);
      }
      const marketData: CoinMarketData[] = await marketResponse.json();
      console.log("Market API Response:", marketData);

      // Step 3: Combine search and market data
      const formattedResults: Coin[] = searchData.coins.map((coin) => {
        const marketInfo = marketData.find((m) => m.id === coin.id);
        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          address: coin.contract_address || "N/A",
          image: coin.large,
          price: marketInfo?.current_price || 0, // Default to 0 if no price
        };
      });
      console.log("Formatted Results:", formattedResults);
      setLocalResults(formattedResults);
    } catch (error) {
      console.error("Error fetching coins:", error);
      setLocalResults([]);
    }
  };

  const handleLocalCoinClick = (coin: Coin) => {
    onCoinClick(coin); // Pass click event to parent
    setLocalResults([]); // Clear dropdown after selection
    setQuery(""); // Clear input
  };

  return (
    <div className="relative mb-5">
      <form
        onSubmit={handleSearch}
        className="sm:mx-5 mx-2 rounded-full bg-green-200 inline-block "
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or contract address"
          className="p-2 sm:w-[400px] rounded-full focus:outline-none bg-green-200"
        />
        <button
          className="bg-teal-950 text-white p-2 rounded-full text-sm m-1"
          type="submit"
        >
          Search
        </button>
      </form>
      {localResults.length > 0 && (
        <div
          className="sm:mx-5 mx-2"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            // width: "50%",
            maxHeight: "200px",
            overflowY: "auto",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 10,
          }}
        >
          <CoinList
            coins={localResults}
            onCoinClick={handleLocalCoinClick}
            showExtraInfo={false}
          />
        </div>
      )}
    </div>
  );
}
