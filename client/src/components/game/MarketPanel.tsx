import { useStockGame } from "@/lib/stores/useStockGame";

export default function MarketPanel() {
  const { stocks, selectedTicker, selectStock } = useStockGame();

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 h-full overflow-hidden flex flex-col">
      <div className="px-3 py-2 border-b border-slate-700">
        <h2 className="text-white font-bold text-sm">Market</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {stocks.map((stock) => {
          const change = stock.price - stock.previousPrice;
          const changePercent = stock.previousPrice > 0 
            ? ((change / stock.previousPrice) * 100) 
            : 0;
          const isPositive = change >= 0;
          const isSelected = selectedTicker === stock.ticker;
          
          return (
            <div
              key={stock.ticker}
              onClick={() => selectStock(stock.ticker)}
              className={`px-3 py-2 cursor-pointer transition-colors border-b border-slate-800 ${
                isSelected 
                  ? "bg-blue-900/50 border-l-2 border-l-blue-500" 
                  : "hover:bg-slate-800/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{stock.ticker}</span>
                    <span className="text-slate-500 text-xs truncate">{stock.sector}</span>
                  </div>
                  <div className="text-slate-400 text-xs truncate">{stock.name}</div>
                </div>
                
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-white font-semibold text-sm">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div className={`text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
