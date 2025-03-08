import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value:
  //             "default-src 'self'; script-src 'self' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com; connect-src 'self' https://*.googleapis.com ws://localhost:* wss://*.firebaseio.com;",
  //         },
  //       ],
  //     },
  //   ];
  // },
  /* config options here */
  images: {
    domains: ["coin-images.coingecko.com"], // Add CoinGecko's image domain
  },
};

export default nextConfig;
