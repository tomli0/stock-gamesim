import { useState, useMemo } from "react";
import { useStockGame } from "@/lib/stores/useStockGame";

function Sparkline({ data, width = 150, height = 40 }: { data: number[], width?: number, height?: number }) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(" L ")}`;
  }, [data, width, height]);
  
  const isPositive = data.length >= 2 && data[data.length - 1] >= data[0];
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TradePanel() {
  const { 
    stocks, 
    selectedTicker, 
    cash,
    getPosition,
    buyStock,
    sellStock,
  } = useStockGame();
  
  const [quantity, setQuantity] = useState<string>("1");
  
  const selectedStock = stocks.find(s => s.ticker === selectedTicker);
  const position = selectedTicker ? getPosition(selectedTicker) : undefined;
  
  const qty = parseInt(quantity) || 0;
  const estimatedCost = selectedStock ? qty * selectedStock.price : 0;
  const maxBuyable = selectedStock ? Math.floor(cash / selectedStock.price) : 0;
  
  const handleBuy = () => {
    if (selectedTicker && qty > 0) {
      const success = buyStock(selectedTicker, qty);
      if (success) setQuantity("1");
    }
  };
  
  const handleSell = () => {
    if (selectedTicker && qty > 0) {
      sellStock(selectedTicker, qty);
      setQuantity("1");
    }
  };
  
  if (!selectedStock) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-sm border-l border-slate-700 h-full flex items-center justify-center">
        <div className="text-slate-500 text-sm text-center px-4">
          Select a stock from the market to trade
        </div>
      </div>
    );
  }
  
  const change = selectedStock.price - selectedStock.previousPrice;
  const changePercent = selectedStock.previousPrice > 0 
    ? ((change / selectedStock.previousPrice) * 100) 
    : 0;
  const isPositive = change >= 0;
  
  const unrealizedPnL = position 
    ? (selectedStock.price - position.avgCost) * position.shares 
    : 0;
  
  return (
    <div className="trade-panel bg-slate-900/95 backdrop-blur-sm border-l border-slate-700 h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-white font-bold text-sm">Trade</h2>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-lg">{selectedStock.ticker}</span>
            <span className="text-slate-500 text-sm">{selectedStock.sector}</span>
          </div>
          <div className="text-slate-400 text-sm">{selectedStock.name}</div>
        </div>
        
        <div>
          <div className="text-white font-bold text-2xl">
            ${selectedStock.price.toFixed(2)}
          </div>
          <div className={`text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-2">30-Day Chart</div>
          <Sparkline data={selectedStock.priceHistory} width={180} height={50} />
        </div>
        
        {position && (
          <div className="position-info bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-2">Your Position</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500">Shares:</span>
                <span className="text-white ml-2 font-semibold">{position.shares}</span>
              </div>
              <div>
                <span className="text-slate-500">Avg Cost:</span>
                <span className="text-white ml-2">${position.avgCost.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Value:</span>
                <span className="text-white ml-2">${(position.shares * selectedStock.price).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">P/L:</span>
                <span className={`ml-2 font-semibold ${unrealizedPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {unrealizedPnL >= 0 ? "+" : ""}${unrealizedPnL.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="trade-controls space-y-3">
          <div>
            <label className="text-slate-400 text-xs block mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="text-slate-400 text-xs">
            Est. {qty > 0 && maxBuyable >= qty ? "Cost" : "Cost"}: 
            <span className={`ml-1 ${estimatedCost > cash ? "text-red-400" : "text-white"}`}>
              ${estimatedCost.toFixed(2)}
            </span>
            <span className="text-slate-500 ml-2">(Max: {maxBuyable})</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleBuy}
              disabled={qty <= 0 || estimatedCost > cash}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Buy
            </button>
            <button
              onClick={handleSell}
              disabled={qty <= 0 || !position || position.shares < qty}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
