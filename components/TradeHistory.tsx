
import React from 'react';
import { Trade, OrderSide } from '../types';

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg mt-4 flex-grow flex flex-col">
      <h2 className="text-lg font-bold p-3 border-b border-gray-700">Trade History</h2>
      <div className="flex justify-between text-xs text-gray-500 font-semibold px-3 py-2 border-b border-gray-700">
        <span className="w-1/3">Time</span>
        <span className="w-1/3 text-right">Price (USDT)</span>
        <span className="w-1/3 text-right">Quantity (BTC)</span>
      </div>
      <div className="flex-grow overflow-y-auto">
        {trades.map(trade => (
          <div key={trade.id} className={`flex justify-between items-center text-xs font-mono px-3 py-1.5 ${trade.aggressorSide === OrderSide.BUY ? 'text-green-400' : 'text-red-400'}`}>
            <span className="w-1/3 text-gray-400">{new Date(trade.timestamp).toLocaleTimeString()}</span>
            <span className="w-1/3 text-right">{trade.price.toFixed(2)}</span>
            <span className="w-1/3 text-right">{trade.quantity.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeHistory;
