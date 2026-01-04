import { useStockGame } from "@/lib/stores/useStockGame";
import { useIdleIncome } from "@/lib/stores/useIdleIncome";
import { useEffect, useState, useRef } from "react";

export default function EndOfDayModal() {
  const { 
    showEndOfDayModal, 
    day, 
    dailyPnL, 
    dailyNews,
    hadNewsToday,
    stocks,
    positions,
    startNewDay,
    getPortfolioValue,
    getTotalValue,
  } = useStockGame();
  
  const fundSize = useIdleIncome(state => state.fundSize);
  const [fundGrowth, setFundGrowth] = useState(0);
  const hasAppliedRef = useRef(false);
  
  useEffect(() => {
    if (showEndOfDayModal && !hasAppliedRef.current) {
      hasAppliedRef.current = true;
      
      const totalValue = getTotalValue();
      const portfolioValue = getPortfolioValue();
      const dailyReturn = totalValue > 0 ? dailyPnL / totalValue : 0;
      const prevFundSize = useIdleIncome.getState().fundSize;
      
      useIdleIncome.getState().applyTradingPerformance(dailyReturn, portfolioValue);
      
      const newFundSize = useIdleIncome.getState().fundSize;
      setFundGrowth(newFundSize - prevFundSize);
    }
  }, [showEndOfDayModal, dailyPnL, getTotalValue, getPortfolioValue]);
  
  useEffect(() => {
    if (!showEndOfDayModal) {
      hasAppliedRef.current = false;
      setFundGrowth(0);
    }
  }, [showEndOfDayModal]);
  
  if (!showEndOfDayModal) return null;
  
  const positionPerformance = positions.map(pos => {
    const stock = stocks.find(s => s.ticker === pos.ticker);
    if (!stock) return null;
    const change = stock.price - stock.previousPrice;
    const pnl = change * pos.shares;
    return { ticker: pos.ticker, pnl };
  }).filter(Boolean) as { ticker: string; pnl: number }[];
  
  const sortedPerformance = [...positionPerformance].sort((a, b) => b.pnl - a.pnl);
  const biggestWinner = sortedPerformance[0];
  const biggestLoser = sortedPerformance[sortedPerformance.length - 1];
  
  const repChange = dailyPnL > 0 
    ? Math.min(3, Math.max(1, Math.floor(dailyPnL / 5000)))
    : dailyPnL < 0 
      ? Math.max(-3, Math.min(-1, Math.ceil(dailyPnL / 5000)))
      : 0;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="end-of-day-modal bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-bold text-xl">End of Day {day}</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Daily P/L</div>
            <div className={`text-2xl font-bold ${dailyPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
              {dailyPnL >= 0 ? "+" : ""}${dailyPnL.toFixed(2)}
            </div>
          </div>
          
          {positionPerformance.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {biggestWinner && biggestWinner.pnl > 0 && (
                <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-3">
                  <div className="text-green-400 text-xs mb-1">Best Performer</div>
                  <div className="text-white font-bold">{biggestWinner.ticker}</div>
                  <div className="text-green-400 text-sm">+${biggestWinner.pnl.toFixed(2)}</div>
                </div>
              )}
              {biggestLoser && biggestLoser.pnl < 0 && (
                <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-3">
                  <div className="text-red-400 text-xs mb-1">Worst Performer</div>
                  <div className="text-white font-bold">{biggestLoser.ticker}</div>
                  <div className="text-red-400 text-sm">${biggestLoser.pnl.toFixed(2)}</div>
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Reputation</div>
              <div className={`text-lg font-bold ${repChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {repChange >= 0 ? "+" : ""}{repChange}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Fund Growth</div>
              <div className={`text-lg font-bold ${fundGrowth >= 0 ? "text-purple-400" : "text-red-400"}`}>
                {fundGrowth >= 0 ? "+" : ""}${Math.abs(fundGrowth).toFixed(0)}
              </div>
            </div>
          </div>
          
          {hadNewsToday && dailyNews.length > 0 ? (
            <div className="bg-slate-800/30 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-2">Today's Headlines</div>
              <p className="text-slate-300 text-sm italic">
                Today's headlines influenced market movement.
              </p>
              <div className="space-y-1 mt-2">
                {dailyNews.map((news) => (
                  <div key={news.id} className="text-slate-400 text-xs flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>{news.headline}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 rounded-lg p-3">
              <p className="text-slate-400 text-sm">Quiet day. No major headlines.</p>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-slate-700">
          <button
            onClick={startNewDay}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Start Day {day + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
