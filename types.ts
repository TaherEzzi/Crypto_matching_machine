
export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  IOC = 'ioc', // Immediate-Or-Cancel
  FOK = 'fok', // Fill-Or-Kill
}

// Order that rests on the book
export interface Order {
  id: string;
  side: OrderSide;
  price: number;
  quantity: number;
  timestamp: number;
}

// New order submitted by the user
export interface NewOrder {
  type: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number; // Optional for market orders
}

export interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  aggressorSide: OrderSide;
  makerOrderId: string;
  takerOrderId: string; // A temporary ID for the incoming order
  timestamp: number;
}

export interface OrderBookLevel {
    price: number;
    quantity: number;
    total: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface BBO {
    bestBid: number | null;
    bestAsk: number | null;
    spread: number | null;
}
