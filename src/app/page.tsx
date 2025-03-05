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
  const [currency, setCurrency] = useState<string>("usd");

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
    <div className="bg-teal-950 h-full overflow-y-hidden">
      <Navbar />
      <Sidebar />
      <div className="sm:ml-64 mt-16">
        <div className="flex items-center justify-between">
          <h1 className="text-green-300 sm:px-10 px-3 py-7 sm:text-3xl text-2xl font-bold">
            Crypto Tracker
          </h1>
          <div className="m-3 flex gap-2 text-sm bg-green-300 rounded-md p-1 text-white">
            <button
              onClick={() => {
                setCurrency("usd");
              }}
              className={`${
                currency === "usd" ? "bg-teal-950" : ""
              } p-1 rounded-md`}
            >
              USD
            </button>
            <button
              className={`${
                currency === "NGN" ? "bg-teal-950" : ""
              } p-1 rounded-md`}
              onClick={() => setCurrency("NGN")}
            >
              NGN
            </button>
          </div>
        </div>
        <SearchBar onCoinClick={handleCoinClick} />
        <div>
          <div className="mt-5">
            <h3 className="text-green-300 text-2xl font-bold sm:px-10 px-3 py-5">
              Total: {currency === "usd" ? "$" : "NGN"}
              {currency === "usd"
                ? Number(totalValue.toFixed(2)).toLocaleString()
                : Number((totalValue * 1500).toFixed(2)).toLocaleString()}
            </h3>

            <hr className="w-[90%] mx-auto" />
          </div>
          <div className="mb-20">
            <h2 className="text-green-300 text-xl font-bold sm:px-10 px-3 py-5">
              Tracked Coins
            </h2>
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
