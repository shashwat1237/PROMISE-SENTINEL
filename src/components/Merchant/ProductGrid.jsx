import React, { useState } from 'react';
import { ScrambleText } from './ScrambleText';
import { useTheatricalTransaction } from '../../hooks/useTheatricalTransaction';

export const ProductGrid = () => {
  const { executeTransaction } = useTheatricalTransaction();
  const [activeItem, setActiveItem] = useState(null);

  const handleBuy = (index, price, display) => {
    setActiveItem(index);
    executeTransaction(price, display);
    setTimeout(() => setActiveItem(null), 650);
  };

  const products = [
    { name: "FESTIVAL PASS", price: 150, display: "$150.00" },
    { name: "DRINK TOKEN", price: 15, display: "$15.00" },
    { name: "VIP UPGRADE", price: 75, display: "$75.00" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((p, i) => (
        <button
          key={i}
          onClick={() => handleBuy(i, p.price, p.display)}
          disabled={activeItem !== null}
          className={`h-32 bg-neutral-800 border border-neutral-700 relative overflow-hidden group transition-all
          ${activeItem === i ? 'border-emerald-500' : 'hover:bg-neutral-700 active:scale-95'}
          ${activeItem !== null && activeItem !== i ? 'opacity-50' : ''}
          `}
        >
          <div className="flex flex-col items-center z-10 relative">
            <span className="text-lg text-neutral-400 font-mono tracking-widest">{p.name}</span>
            <div className="text-2xl mt-2 font-bold text-emerald-400">
              <ScrambleText text={p.display} scramble={activeItem === i} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};