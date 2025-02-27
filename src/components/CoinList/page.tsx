import { Coin } from "@/types/crypto";
import Image from "next/image";
import { useState, useEffect } from "react";

interface CoinListProps {
  coins: Coin[];
  onCoinClick?: (coin: Coin) => void;
  onDeleteCoin?: (coinId: string) => void;
  onUpdateCoin?: (updatedCoin: Coin) => void;
  onTotalsChange?: (total: number) => void;
  showExtraInfo: boolean;
}

export default function CoinList({
  coins,
  onCoinClick,
  onDeleteCoin,
  onUpdateCoin,
  onTotalsChange,
  showExtraInfo = true,
}: CoinListProps) {
  const [editCoin, setEditCoin] = useState<Coin | null>(null);
  const [progressInput, setProgressInput] = useState("");
  const [desiredInput, setDesiredInput] = useState("");

  // Calculate total sum of progress * price for all coins
  const totalSum = coins.reduce((sum, coin) => {
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

  const handleSave = () => {
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

    onUpdateCoin(updatedCoin);
    setEditCoin(null);
  };

  return (
    <>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {coins.length > 0 ? (
          coins.map((coin) => {
            const progress = coin.progress || 0;
            const desired = coin.desiredHighestNumber || 0;
            const progressPercentage =
              desired > 0 ? Math.min((progress / desired) * 100, 100) : 0;

            return (
              <li
                key={coin.id}
                onClick={() => onCoinClick?.(coin)}
                style={{
                  padding: "10px",
                  margin: "5px 0",
                  // background: "#f0f0f0",
                  borderRadius: "4px",
                  cursor: onCoinClick ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Image
                  src={coin.image}
                  alt={`${coin.name} logo`}
                  width={32}
                  height={32}
                  style={{ marginRight: "10px" }}
                />
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <strong>{coin.name}</strong> ({coin.symbol})<br />
                  {showExtraInfo && (
                    <div>
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        Price: ${coin.price}
                      </p>
                      <p>Total: ${Number(progress) * coin.price}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 min-w-52">
                  {showExtraInfo && (
                    <div className="w-40">
                      <div className="bg-slate-300 h-3 rounded-md overflow-hidden">
                        <div
                          style={{
                            width: `${progressPercentage}%`,
                            background: "#4caf50",
                            height: "100%",
                          }}
                        />
                      </div>

                      <small>
                        {progress}/{desired}
                      </small>
                    </div>
                  )}
                  {onUpdateCoin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(coin);
                      }}
                      style={{
                        padding: "4px 8px",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {onDeleteCoin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCoin(coin.id);
                      }}
                      className="text-red-800"
                    >
                      <p className="text-xl">x</p>
                    </button>
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <li>No results</li>
        )}
      </ul>

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
            <h3>Edit {editCoin.name}</h3>
            {!editCoin.desiredHighestNumber ? (
              <>
                <label>
                  Desired Highest Number:
                  <input
                    type="number"
                    value={desiredInput}
                    onChange={(e) => setDesiredInput(e.target.value)}
                    style={{
                      display: "block",
                      margin: "10px 0",
                      padding: "5px",
                    }}
                  />
                </label>
                <label>
                  Initial Progress:
                  <input
                    type="number"
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    style={{
                      display: "block",
                      margin: "10px 0",
                      padding: "5px",
                    }}
                  />
                </label>
              </>
            ) : (
              <label>
                Add to Progress:
                <input
                  type="number"
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  style={{ display: "block", margin: "10px 0", padding: "5px" }}
                />
              </label>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSave}
                style={{
                  padding: "8px 16px",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditCoin(null)}
                style={{
                  padding: "8px 16px",
                  background: "#ccc",
                  color: "black",
                  border: "none",
                  borderRadius: "4px",
                }}
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
