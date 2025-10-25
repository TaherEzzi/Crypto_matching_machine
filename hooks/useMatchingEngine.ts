
import { useReducer, useCallback, useMemo, useEffect, useState } from 'react';
// FIX: Import `OrderBookLevel` to resolve TypeScript error.
import { Order, OrderSide, OrderType, NewOrder, Trade, OrderBook, BBO, OrderBookLevel } from '../types';

const SYMBOL = 'BTC-USDT';

interface EngineState {
  bids: Order[]; // Sorted high to low price
  asks: Order[]; // Sorted low to high price
  trades: Trade[];
  sequence: number;
}

type Action =
  | { type: 'SUBMIT_ORDER'; payload: NewOrder }
  | { type: 'SEED_DATA' };

const initialState: EngineState = {
  bids: [],
  asks: [],
  trades: [],
  sequence: 0,
};

const reducer = (state: EngineState, action: Action): EngineState => {
  if (action.type === 'SEED_DATA') {
    const asks: Order[] = [];
    const bids: Order[] = [];
    let seq = state.sequence;
    const basePrice = 45000;
    
    for (let i = 0; i < 15; i++) {
        const priceAsk = basePrice + (i + 1) * 0.5;
        const priceBid = basePrice - (i + 1) * 0.5;
        const quantity = Math.random() * 5 + 0.1;
        
        asks.push({ id: `ask-${seq++}`, side: OrderSide.SELL, price: priceAsk, quantity: quantity, timestamp: Date.now() + i });
        bids.push({ id: `bid-${seq++}`, side: OrderSide.BUY, price: priceBid, quantity: quantity, timestamp: Date.now() + i });
    }
    
    return {
        ...state,
        bids: bids.sort((a, b) => b.price - a.price),
        asks: asks.sort((a, b) => a.price - b.price),
        sequence: seq
    };
  }
  
  if (action.type === 'SUBMIT_ORDER') {
    let { bids, asks, trades, sequence } = {
        ...state,
        bids: [...state.bids],
        asks: [...state.asks],
        trades: [...state.trades]
    };
    
    const takerOrder = action.payload;
    const takerOrderId = `taker-${sequence++}`;
    let remainingQuantity = takerOrder.quantity;
    const newTrades: Trade[] = [];

    if (takerOrder.type === OrderType.FOK) {
        let fillableQuantity = 0;
        if (takerOrder.side === OrderSide.BUY) {
            const limitPrice = takerOrder.price ?? Infinity;
            fillableQuantity = asks.filter(o => o.price <= limitPrice).reduce((sum, o) => sum + o.quantity, 0);
        } else {
            const limitPrice = takerOrder.price ?? 0;
            fillableQuantity = bids.filter(o => o.price >= limitPrice).reduce((sum, o) => sum + o.quantity, 0);
        }

        if (fillableQuantity < takerOrder.quantity) {
            return { ...state, sequence }; // Kill the order, do nothing
        }
    }

    if (takerOrder.side === OrderSide.BUY) {
      const matchingAsks = asks.filter(ask => takerOrder.type === OrderType.MARKET || (takerOrder.price && ask.price <= takerOrder.price));
      
      for (const makerOrder of matchingAsks) {
        if (remainingQuantity <= 0) break;
        
        const tradeQuantity = Math.min(remainingQuantity, makerOrder.quantity);
        
        const trade: Trade = {
          id: `trade-${sequence++}`,
          symbol: SYMBOL,
          price: makerOrder.price,
          quantity: tradeQuantity,
          aggressorSide: OrderSide.BUY,
          makerOrderId: makerOrder.id,
          takerOrderId,
          timestamp: Date.now(),
        };
        newTrades.push(trade);
        
        remainingQuantity -= tradeQuantity;
        makerOrder.quantity -= tradeQuantity;
      }
      
      asks = asks.filter(ask => ask.quantity > 0.00001);

    } else { // SELL
      const matchingBids = bids.filter(bid => takerOrder.type === OrderType.MARKET || (takerOrder.price && bid.price >= takerOrder.price));
      
      for (const makerOrder of matchingBids) {
        if (remainingQuantity <= 0) break;
        
        const tradeQuantity = Math.min(remainingQuantity, makerOrder.quantity);
        
        const trade: Trade = {
          id: `trade-${sequence++}`,
          symbol: SYMBOL,
          price: makerOrder.price,
          quantity: tradeQuantity,
          aggressorSide: OrderSide.SELL,
          makerOrderId: makerOrder.id,
          takerOrderId,
          timestamp: Date.now(),
        };
        newTrades.push(trade);
        
        remainingQuantity -= tradeQuantity;
        makerOrder.quantity -= tradeQuantity;
      }

      bids = bids.filter(bid => bid.quantity > 0.00001);
    }
    
    if (remainingQuantity > 0.00001 && (takerOrder.type === OrderType.LIMIT)) {
        const newRestingOrder: Order = {
            id: `order-${sequence++}`,
            side: takerOrder.side,
            price: takerOrder.price!,
            quantity: remainingQuantity,
            timestamp: Date.now()
        };
        if (takerOrder.side === OrderSide.BUY) {
            bids.push(newRestingOrder);
            bids.sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);
        } else {
            asks.push(newRestingOrder);
            asks.sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);
        }
    }
    
    return {
      bids,
      asks,
      trades: [...newTrades.reverse(), ...trades],
      sequence,
    };
  }

  return state;
};

const aggregateOrderBook = (orders: Order[], side: 'bids' | 'asks'): OrderBookLevel[] => {
    const levels: { [price: number]: number } = {};
    for (const order of orders) {
        if (!levels[order.price]) {
            levels[order.price] = 0;
        }
        levels[order.price] += order.quantity;
    }
    
    let cumulative = 0;
    const sortedLevels = Object.entries(levels)
        .map(([price, quantity]) => ({ price: parseFloat(price), quantity }))
        .sort((a, b) => side === 'bids' ? b.price - a.price : a.price - b.price)
        .slice(0, 15);

    if (side === 'asks') {
      sortedLevels.reverse();
    }
    
    const finalLevels = sortedLevels.map(level => {
        cumulative += level.quantity;
        return { ...level, total: cumulative };
    });

    return side === 'asks' ? finalLevels.reverse() : finalLevels;
}

export const useMatchingEngine = (autoTrade: boolean) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    if(!isSeeded){
        dispatch({ type: 'SEED_DATA' });
        setIsSeeded(true);
    }
  }, [isSeeded]);

  useEffect(() => {
      if (!autoTrade || !isSeeded) return;

      const interval = setInterval(() => {
          const side = Math.random() > 0.5 ? OrderSide.BUY : OrderSide.SELL;
          const type = Math.random() > 0.3 ? OrderType.LIMIT : OrderType.MARKET;
          const quantity = Math.random() * 0.5 + 0.01;
          
          const bestBid = state.bids[0]?.price || 45000;
          const bestAsk = state.asks[0]?.price || 45001;

          let price: number | undefined;
          if (type === OrderType.LIMIT) {
              const midPrice = (bestBid + bestAsk) / 2;
              const priceOffset = (Math.random() - 0.5) * 5; // -2.5 to +2.5
              price = parseFloat((midPrice + priceOffset).toFixed(2));
          }

          dispatch({ type: 'SUBMIT_ORDER', payload: { side, type, quantity, price } });
      }, 1500);

      return () => clearInterval(interval);
  }, [autoTrade, state.bids, state.asks, isSeeded]);

  const submitOrder = useCallback((order: NewOrder) => {
    dispatch({ type: 'SUBMIT_ORDER', payload: order });
  }, []);

  const orderBook: OrderBook = useMemo(() => ({
    bids: aggregateOrderBook(state.bids, 'bids'),
    asks: aggregateOrderBook(state.asks, 'asks'),
  }), [state.bids, state.asks]);

  const bbo: BBO = useMemo(() => ({
      bestBid: state.bids.length > 0 ? state.bids[0].price : null,
      bestAsk: state.asks.length > 0 ? state.asks[0].price : null,
      spread: (state.bids.length > 0 && state.asks.length > 0) ? Math.abs(state.asks[0].price - state.bids[0].price) : null,
  }), [state.bids, state.asks]);

  return {
    orderBook,
    trades: state.trades.slice(0, 30),
    bbo,
    submitOrder,
  };
};