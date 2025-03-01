"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar/page";
import CoinList from "@/components/CoinList/page";
import { Coin } from "@/types/crypto";
import Navbar from "@/components/Navbar/page";
import Sidebar from "@/components/Sidebar/page";

export default function Home() {
  const [trackedCoins, setTrackedCoins] = useState<Coin[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  // const [searchResults, setSearchResults] = useState<Coin[]>([]);

  const handleCoinClick = (coin: Coin) => {
    if (!trackedCoins.some((tracked) => tracked.id === coin.id)) {
      setTrackedCoins([...trackedCoins, coin]);
    }
  };

  const handleDeleteCoin = (coinId: string) => {
    setTrackedCoins(trackedCoins.filter((coin) => coin.id !== coinId));
  };

  const handleUpdateCoin = (updatedCoin: Coin) => {
    setTrackedCoins(
      trackedCoins.map((coin) =>
        coin.id === updatedCoin.id ? updatedCoin : coin
      )
    );
  };

  const handleTotalsChange = (total: number) => {
    setTotalValue(total);
  };

  return (
    <div className="bg-teal-950 h-full">
      <Navbar />
      <Sidebar />
      <div className="ml-64 mt-16">
        <h1 className="text-green-300 px-10 py-7 text-3xl font-bold">
          Crypto Tracker
        </h1>
        <SearchBar onCoinClick={handleCoinClick} />
        <div>
          <div style={{ marginTop: "20px" }}>
            <h3 className="text-green-300 text-2xl font-bold px-10 py-5">
              Total: ${totalValue}
            </h3>
          </div>
          <div className="mb-20" style={{ flex: 1 }}>
            <h2>Tracked Coins</h2>
            <CoinList
              coins={trackedCoins}
              showExtraInfo
              onDeleteCoin={handleDeleteCoin}
              onUpdateCoin={handleUpdateCoin}
              onTotalsChange={handleTotalsChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
