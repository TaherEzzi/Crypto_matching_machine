
import React from 'react';
import { BBO } from '../types';

interface BBODisplayProps {
  bbo: BBO;
}

const BBODisplay: React.FC<BBODisplayProps> = ({ bbo }) => {
  const formatPrice = (price: number | null) => price ? price.toFixed(2) : '---';

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4 flex justify-around items-center text-center">
      <div>
        <p className="text-sm text-gray-400">Best Bid</p>
        <p className="text-xl font-mono text-green-400">{formatPrice(bbo.bestBid)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Spread</p>
        <p className="text-xl font-mono">{bbo.spread !== null ? bbo.spread.toFixed(2) : '---'}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">Best Ask</p>
        <p className="text-xl font-mono text-red-400">{formatPrice(bbo.bestAsk)}</p>
      </div>
    </div>
  );
};

export default BBODisplay;
