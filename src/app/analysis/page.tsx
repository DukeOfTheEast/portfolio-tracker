"use client";

// import { useState } from "react";
import TradingViewChart from "@/components/TradingViewChart/page";
import Navbar from "@/components/Navbar/page";
import Sidebar from "@/components/Sidebar/page";

export default function ChartsPage() {
  //   const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className="container mx-auto px-4 py-8 sm:ml-64 sm:w-2/3 mt-16">
      <Navbar />
      <Sidebar />
      <div className="mb-6">
        <p className="text-white">
          View real-time charts for various cryptocurrency pairs
        </p>
      </div>

      {/* <div className="mb-4 flex justify-end">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Toggle {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div> */}

      <TradingViewChart defaultSymbol="BTCUSD" height={600} />
    </div>
  );
}
