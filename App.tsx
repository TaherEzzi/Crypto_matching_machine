
import React, { useState } from 'react';
import { useMatchingEngine } from './hooks/useMatchingEngine';
import OrderForm from './components/OrderForm';
import OrderBook from './components/OrderBook';
import TradeHistory from './components/TradeHistory';
import BBODisplay from './components/BBODisplay';

function App() {
  const [autoTrade, setAutoTrade] = useState(true);
  const { orderBook, trades, bbo, submitOrder } = useMatchingEngine(autoTrade);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Crypto Matching Engine</h1>
            <p className="text-sm text-gray-400">A REG NMS-inspired Simulator</p>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="autoTradeToggle" className="text-sm text-gray-400">Auto Trader:</label>
            <button 
              id="autoTradeToggle"
              onClick={() => setAutoTrade(prev => !prev)} 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoTrade ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoTrade ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
             <BBODisplay bbo={bbo} />
             <div className="h-[calc(100vh-14rem)] min-h-[500px]">
                <OrderBook orderBook={orderBook} />
            </div>
          </div>

          <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[600px]">
            <OrderForm onSubmit={submitOrder} />
            <TradeHistory trades={trades} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
