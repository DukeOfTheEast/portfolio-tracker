export interface Coin {
  id: string;
  name: string;
  symbol: string;
  address: string;
  image: string;
  price: number;
  progress?: number;
  desiredHighestNumber?: number;
  //   onCoinClick: string | number | boolean;
}
