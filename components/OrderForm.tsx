
import React, { useState, useCallback } from 'react';
import { NewOrder, OrderSide, OrderType } from '../types';

interface OrderFormProps {
  onSubmit: (order: NewOrder) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit }) => {
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const [type, setType] = useState<OrderType>(OrderType.LIMIT);
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    const order: NewOrder = {
      side,
      type,
      quantity: qty,
    };
    
    if (type !== OrderType.MARKET) {
      const p = parseFloat(price);
      if (!p || p <= 0) {
        alert("Please enter a valid price for a limit order.");
        return;
      }
      order.price = p;
    }
    
    onSubmit(order);
    setPrice('');
    setQuantity('');
  };

  const handleTypeChange = useCallback((newType: OrderType) => {
    setType(newType);
    if (newType === OrderType.MARKET) {
        setPrice('');
    }
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-4">Place Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button type="button" onClick={() => setSide(OrderSide.BUY)} className={`w-full p-2 rounded ${side === OrderSide.BUY ? 'bg-green-600' : 'bg-gray-700 hover:bg-green-700'}`}>BUY</button>
          <button type="button" onClick={() => setSide(OrderSide.SELL)} className={`w-full p-2 rounded ${side === OrderSide.SELL ? 'bg-red-600' : 'bg-gray-700 hover:bg-red-700'}`}>SELL</button>
        </div>
        
        <div className="flex text-sm mb-3 rounded-md bg-gray-700 p-0.5">
            <button type="button" onClick={() => handleTypeChange(OrderType.LIMIT)} className={`flex-1 p-1.5 rounded-md ${type === OrderType.LIMIT ? 'bg-gray-900 shadow' : 'hover:bg-gray-600'}`}>Limit</button>
            <button type="button" onClick={() => handleTypeChange(OrderType.MARKET)} className={`flex-1 p-1.5 rounded-md ${type === OrderType.MARKET ? 'bg-gray-900 shadow' : 'hover:bg-gray-600'}`}>Market</button>
            <button type="button" onClick={() => handleTypeChange(OrderType.IOC)} className={`flex-1 p-1.5 rounded-md ${type === OrderType.IOC ? 'bg-gray-900 shadow' : 'hover:bg-gray-600'}`}>IOC</button>
            <button type="button" onClick={() => handleTypeChange(OrderType.FOK)} className={`flex-1 p-1.5 rounded-md ${type === OrderType.FOK ? 'bg-gray-900 shadow' : 'hover:bg-gray-600'}`}>FOK</button>
        </div>

        <div className="mb-3">
          <label htmlFor="price" className="text-xs text-gray-400">Price (USDT)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={type === OrderType.MARKET}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            placeholder={type === OrderType.MARKET ? 'Market Price' : '0.00'}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="quantity" className="text-xs text-gray-400">Quantity (BTC)</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.0000"
          />
        </div>
        
        <button type="submit" className={`w-full p-3 rounded font-bold ${side === OrderSide.BUY ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>
          {side.toUpperCase()} BTC
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
