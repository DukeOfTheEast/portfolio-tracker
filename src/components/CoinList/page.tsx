"use client";

import { Coin } from "@/types/crypto";
import { Edit, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/app/firebase/firebase-config";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore";

interface CoinListProps {
  coins: Coin[];
  onCoinClick?: (coin: Coin) => void;
  onDeleteCoin?: (coinId: string) => void;
  onUpdateCoin?: (updatedCoin: Coin) => void;
  onTotalsChange?: (total: number) => void;
  showExtraInfo: boolean;
}

export default function CoinList({
  coins: propCoins,
  onCoinClick,
  onDeleteCoin,
  onUpdateCoin,
  onTotalsChange,
  showExtraInfo = true,
}: CoinListProps) {
  const [editCoin, setEditCoin] = useState<Coin | null>(null);
  const [progressInput, setProgressInput] = useState("");
  const [desiredInput, setDesiredInput] = useState("");
  const [userCoins, setUserCoins] = useState<Coin[]>([]); // State for Firestore data
  const [user, loading] = useAuthState(auth); // Get authenticated user
  const [isLoading, setIsLoading] = useState(true);

  // Fetch coins from Firestore for the current user
  useEffect(() => {
    if (loading) {
      console.log("Auth state still loading...");
      return; // Wait until auth state is resolved
    }

    if (user) {
      setIsLoading(true);
      console.log("Fetching user coins for:", user.uid);

      const q = query(
        collection(db, "user_coins"),
        where("userId", "==", user.uid)
      );

      getDocs(q)
        .then((snapshot) => {
          const coinsData = snapshot.docs.map((doc) => doc.data().coin as Coin);
          console.log("Initial coins data:", coinsData);
          setUserCoins(coinsData);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching initial user coins:", error);
          setUserCoins([]);
          setIsLoading(false);
        });

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const coinsData = snapshot.docs.map((doc) => doc.data().coin as Coin);
          console.log(coinsData);
          setUserCoins(coinsData);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching user coins:", error);
          setUserCoins([]);
          setIsLoading(false);
        }
      );
      return () => unsubscribe(); // Cleanup subscription on unmount
    } else {
      setUserCoins([]);
      setIsLoading(false);
    }
  }, [user, loading]);

  const coinsToDisplay = propCoins || userCoins;

  // Calculate total sum of progress * price for all coins
  const totalSum = coinsToDisplay.reduce((sum, coin) => {
    const progress = coin.progress || 0;
    return sum + progress * coin.price;
  }, 0);

  // Notify parent of total sum whenever it changes
  useEffect(() => {
    if (onTotalsChange) {
      onTotalsChange(totalSum);
    }
  }, [totalSum, onTotalsChange]);

  const handleEditClick = (coin: Coin) => {
    setEditCoin(coin);
    setProgressInput("");
    setDesiredInput("");
  };

  const handleSave = async () => {
    if (!editCoin || !onUpdateCoin) return;

    const updatedCoin = { ...editCoin };
    const progressAdd = parseFloat(progressInput) || 0;

    if (!editCoin.desiredHighestNumber && desiredInput) {
      // First edit: Set both progress and desiredHighestNumber
      updatedCoin.progress = progressAdd;
      updatedCoin.desiredHighestNumber = parseFloat(desiredInput) || 0;
    } else if (editCoin.desiredHighestNumber) {
      // Subsequent edits: Add to progress
      updatedCoin.progress = (editCoin.progress || 0) + progressAdd;
    }

    try {
      const userCoinRef = doc(db, "user_coins", `${user?.uid}_${editCoin.id}`);
      await setDoc(
        userCoinRef,
        {
          userId: user?.uid,
          coinId: editCoin.id,
          coin: updatedCoin,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`Updated coin ${updatedCoin.name} in Firestore`);
    } catch (error) {
      console.error("Error updating coin in Firestore:", error);
    }

    if (onUpdateCoin) onUpdateCoin(updatedCoin);
    setEditCoin(null);
  };

  return (
    <>
      {isLoading && !propCoins ? (
        <div className="text-center py-4">Loading your portfolio...</div>
      ) : (
        <ul className="list-none p-0 sm:w-[80%] mx-auto ">
          {coinsToDisplay.length > 0 ? (
            coinsToDisplay.map((coin) => {
              const progress = coin.progress || 0;
              const desired = coin.desiredHighestNumber || 0;
              const progressPercentage =
                desired > 0 ? Math.min((progress / desired) * 100, 100) : 0;

              return (
                <li
                  key={coin.id}
                  onClick={() => onCoinClick?.(coin)}
                  className={`p-3 my-1 sm:mx-0 mx-4 bg-green-200 rounded border-b-2 flex justify-between flex-wrap ${
                    onCoinClick ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="flex">
                    <Image
                      src={coin.image}
                      alt={`${coin.name} logo`}
                      width={100}
                      height={100}
                      className="mr-2 w-10 h-10"
                    />
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <strong>{coin.name}</strong> ({coin.symbol})<br />
                      {showExtraInfo && (
                        <div>
                          <p style={{ margin: "5px 0 0", color: "#666" }}>
                            Price: ${coin.price}
                          </p>
                          <p className="">
                            Total: ${Number(progress) * coin.price}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="sm:flex items-center justify-between sm:gap-4 w-full sm:w-2/3">
                    {showExtraInfo && (
                      <div className="w-full">
                        <div className="bg-slate-300 h-3 rounded-md overflow-hidden">
                          <div
                            className="bg-green-800 h-[100%]"
                            style={{
                              width: `${progressPercentage}%`,
                            }}
                          />
                        </div>

                        <small>
                          {progress}/{desired}
                        </small>
                      </div>
                    )}
                    <div className="flex sm:gap-3">
                      {onUpdateCoin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(coin);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit size={25} />
                        </button>
                      )}
                      {onDeleteCoin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCoin(coin.id);
                          }}
                          className=""
                        >
                          <X size={25} />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="bg-teal-950 text-white text-center">
              There is nothing on your portfolio yet...
            </li>
          )}
        </ul>
      )}

      {editCoin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
            }}
          >
            {!editCoin.desiredHighestNumber ? (
              <div className="flex flex-col gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Your target"
                  value={desiredInput}
                  onChange={(e) => setDesiredInput(e.target.value)}
                  className="rounded-xl border border-green-400 p-1 focus:outline-green-600"
                />

                <input
                  type="number"
                  value={progressInput}
                  placeholder="Current Holding"
                  onChange={(e) => setProgressInput(e.target.value)}
                  className="rounded-xl border border-green-400 p-1 focus:outline-green-600"
                />
              </div>
            ) : (
              <input
                type="number"
                placeholder={`Top up ${editCoin.name}`}
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                style={{ display: "block", margin: "10px 0", padding: "5px" }}
                className="border border-green-700 rounded-xl"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 px-3 py-1 rounded-xl text-white"
              >
                Save
              </button>
              <button
                onClick={() => setEditCoin(null)}
                className="border border-green-600 px-2 py-1 rounded-xl text-green-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
