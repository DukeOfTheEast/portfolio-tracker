"use client";

import { useState, useCallback, useEffect } from "react";
import SearchBar from "@/components/SearchBar/page";
import CoinList from "@/components/CoinList/page";
import { Coin } from "@/types/crypto";
import Navbar from "@/components/Navbar/page";
import Sidebar from "@/components/Sidebar/page";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
// import { RefreshCw } from "lucide-react";

export default function Home() {
  const [trackedCoins, setTrackedCoins] = useState<Coin[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("usd");
  const [user, loading] = useAuthState(auth);
  // const [userCoins, setUserCoins] = useState<Coin[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  // Function to load user coins from Firestore
  const loadUserCoins = useCallback(async () => {
    if (!user) {
      setTrackedCoins([]);
      // setIsLoading(false);
      return;
    }

    // setIsLoading(true);
    try {
      console.log("Loading user coins for:", user.uid);
      const q = query(
        collection(db, "user_coins"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);
      const coins = snapshot.docs.map((doc) => doc.data().coin as Coin);
      console.log("Loaded user coins:", coins);
      setTrackedCoins(coins);
    } catch (error) {
      console.error("Error loading user coins:", error);
      setTrackedCoins([]);
    } finally {
      // setIsLoading(false);
    }
  }, [user]);

  // Load coins when user auth state changes
  useEffect(() => {
    if (!loading) {
      loadUserCoins();
    }
  }, [loading, loadUserCoins]);

  const handleCoinClick = (coin: Coin) => {
    if (!trackedCoins.some((tracked) => tracked.id === coin.id)) {
      setTrackedCoins([...trackedCoins, coin]);
    }
    loadUserCoins();
  };

  // const handleDeleteCoin = (coinId: string) => {
  //   setTrackedCoins(trackedCoins.filter((coin) => coin.id !== coinId));
  // };

  const handleDeleteCoin = async (coinId: string) => {
    if (!user) return;

    try {
      const docRef = doc(db, "user_coins", `${user.uid}_${coinId}`);
      await deleteDoc(docRef);
      console.log(`Deleted coin ${coinId}`);
      // Refresh coins after deletion
      loadUserCoins();
    } catch (error) {
      console.error("Error deleting coin:", error);
    }
  };

  const handleUpdateCoin = (updatedCoin: Coin) => {
    setTrackedCoins(
      trackedCoins.map((coin) =>
        coin.id === updatedCoin.id ? updatedCoin : coin
      )
    );
    loadUserCoins();
  };

  const handleTotalsChange = (total: number) => {
    setTotalValue(total);
  };

  return (
    <div className="">
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
            <div className="flex items-center gap-1 text-green-300 text-2xl font-bold sm:px-10 px-3 py-5">
              <h3>
                Total: {currency === "usd" ? "$" : "NGN"}
                {currency === "usd"
                  ? Number(totalValue.toFixed(2)).toLocaleString()
                  : Number((totalValue * 1580).toFixed(2)).toLocaleString()}
              </h3>
              {/* <RefreshCw size={25} className="text-green-300" /> */}
            </div>

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
