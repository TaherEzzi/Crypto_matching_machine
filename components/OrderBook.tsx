
import React from 'react';
import { OrderBook, OrderBookLevel } from '../types';

interface OrderBookProps {
  orderBook: OrderBook;
}

const OrderBookRow: React.FC<{ level: OrderBookLevel, type: 'bid' | 'ask', maxTotal: number }> = ({ level, type, maxTotal }) => {
  const depthPercentage = (level.total / maxTotal) * 100;
  const color = type === 'bid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(248, 113, 113, 0.2)';

  return (
    <div className="relative flex justify-between items-center text-xs font-mono px-2 py-1 overflow-hidden">
      <div
        className="absolute top-0 bottom-0 h-full"
        style={{ width: `${depthPercentage}%`, backgroundColor: color, right: type === 'bid' ? 0 : 'auto', left: type === 'ask' ? 0 : 'auto' }}
      ></div>
      <span className={`${type === 'bid' ? 'text-green-400' : 'text-transparent'}`}>{level.price.toFixed(2)}</span>
      <span>{level.quantity.toFixed(4)}</span>
      <span className="text-gray-400">{level.total.toFixed(4)}</span>
      <span className={`${type === 'ask' ? 'text-red-400' : 'text-transparent'}`}>{level.price.toFixed(2)}</span>
    </div>
  );
};

const OrderBook: React.FC<OrderBookProps> = ({ orderBook }) => {
  const maxBidTotal = orderBook.bids[orderBook.bids.length - 1]?.total || 0;
  const maxAskTotal = orderBook.asks[orderBook.asks.length - 1]?.total || 0;
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg h-full flex flex-col">
        <h2 className="text-lg font-bold p-3 border-b border-gray-700">Order Book</h2>
        <div className="flex justify-between items-center text-xs text-gray-500 font-semibold px-2 py-1 border-b border-gray-700">
            <span>Price (USDT)</span>
            <span>Quantity (BTC)</span>
            <span>Total (BTC)</span>
            <span>Price (USDT)</span>
        </div>
        <div className="flex-grow overflow-y-auto">
            <div className="grid grid-cols-1">
                {orderBook.asks.map((level) => (
                <OrderBookRow key={level.price} level={level} type="ask" maxTotal={maxTotal} />
                ))}
            </div>
            <div className="py-2 border-t border-b border-gray-700 font-bold text-center text-lg">
                {orderBook.asks[0] && orderBook.bids[0] ? (orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2) : '-'}
            </div>
            <div className="grid grid-cols-1">
                {orderBook.bids.map((level) => (
                <OrderBookRow key={level.price} level={level} type="bid" maxTotal={maxTotal} />
                ))}
            </div>
        </div>
    </div>
  );
};

export default OrderBook;
