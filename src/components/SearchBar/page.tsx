import { useState, FormEvent } from "react";
import { Coin } from "@/types/crypto";
import CoinList from "@/components/CoinList/page";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebase-config";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query as firestoreQuery,
  where,
} from "firebase/firestore";

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
  price_change_24h: number;
}

interface SearchBarProps {
  onCoinClick: (coin: Coin) => void;
  refreshUserCoins?: () => void;
}

export default function SearchBar({
  onCoinClick,
  refreshUserCoins,
}: SearchBarProps) {
  const [query, setQuery] = useState<string>("");
  const [localResults, setLocalResults] = useState<Coin[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [user] = useAuthState(auth);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query) {
      setLocalResults([]);
      return;
    }

    try {
      setIsSearching(true);

      // Fetch search results
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
        setIsSearching(false);
        return;
      }

      // Fetch price data
      const marketResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
      );
      if (!marketResponse.ok) {
        throw new Error(`Market HTTP error! status: ${marketResponse.status}`);
      }
      const marketData: CoinMarketData[] = await marketResponse.json();
      console.log("Market API Response:", marketData);

      // Combine search and market data
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
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocalCoinClick = async (coin: Coin) => {
    if (user) {
      try {
        console.log(`Saving coin ${coin.name} for user ${user.uid}`);

        const userCoinsRef = collection(db, "user_coins");
        const q = firestoreQuery(
          userCoinsRef,
          where("userId", "==", user.uid),
          where("coinId", "==", coin.id)
        );

        const existingCoins = await getDocs(q);
        const coinExists = !existingCoins.empty;

        // Prepare the coin data with consistent structure
        const coinData = {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          address: coin.address || "N/A",
          image: coin.image,
          price: coin.price,
        };

        // Create a document reference with a consistent ID format
        const userCoinRef = doc(db, "user_coins", `${user.uid}_${coin.id}`);

        // Save to Firestore with merge option to preserve existing data
        await setDoc(
          userCoinRef,
          {
            userId: user.uid,
            coinId: coin.id,
            coin: coinData,
            updatedAt: new Date().toISOString(),

            ...(coinExists ? {} : { createdAt: new Date().toISOString() }),
          },
          { merge: true }
        );

        console.log(`Coin ${coin.name} successfully saved to Firestore`);

        // Call the refresh function if provided
        if (refreshUserCoins) {
          console.log("Triggering user coins refresh");
          refreshUserCoins();
        }
      } catch (error) {
        console.error("Error saving coin to Firestore:", error);
      }
    } else {
      console.log("User not authenticated, coin not saved");
    }

    onCoinClick(coin);
    setLocalResults([]);
    setQuery("");
  };

  return (
    <div className="relative mb-5">
      <form
        onSubmit={handleSearch}
        className="sm:mx-5 mx-2 rounded-full bg-green-200 inline-block"
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
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>
      {localResults.length > 0 && (
        <div className="sm:mx-5 mx-2 absolute top-[100%] left-0 w-[100%] max-w-[500px] max-h-[300px] overflow-y-auto bg-green-200 border border-slate-100 rounded-xl z-10">
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
