import { useStockGame } from "@/lib/stores/useStockGame";
import { useIdleIncome } from "@/lib/stores/useIdleIncome";
import { useState, useEffect } from "react";

interface TopBarProps {
  onOpenShop?: () => void;
  onOpenProfile?: () => void;
}

export default function TopBar({ onOpenShop, onOpenProfile }: TopBarProps) {
  const { 
    day, 
    cash, 
    reputation, 
    newClientUsedToday,
    getCareerLevel,
    getPortfolioValue,
    getTotalValue,
    useNewClient,
  } = useStockGame();

  const { fundSize, getIncomePerSecond, isBoostActive, getBoostTimeRemaining } = useIdleIncome();
  const careerLevel = getCareerLevel();
  const portfolioValue = getPortfolioValue();
  const totalValue = getTotalValue();
  const incomePerSecond = getIncomePerSecond(careerLevel);
  
  const doubleIncomeActive = isBoostActive("double-income");
  const [boostTimeLeft, setBoostTimeLeft] = useState(0);
  
  useEffect(() => {
    if (!doubleIncomeActive) {
      setBoostTimeLeft(0);
      return;
    }
    
    const updateTime = () => {
      const remaining = getBoostTimeRemaining("double-income");
      setBoostTimeLeft(remaining);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [doubleIncomeActive, getBoostTimeRemaining]);
  
  const formatBoostTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const levelColors: Record<string, string> = {
    Junior: "bg-gray-500",
    Associate: "bg-blue-500",
    Senior: "bg-purple-500",
    Partner: "bg-amber-500",
  };

  return (
    <div className="top-bar bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Day</span>
          <span className="text-white font-bold">{day}</span>
        </div>
        
        <div className="h-5 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Cash</span>
          <span className="text-green-400 font-semibold text-sm">${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="h-5 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Portfolio</span>
          <span className="text-blue-400 font-semibold text-sm">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="h-5 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Fund</span>
          <span className="text-purple-400 font-semibold text-sm">
            ${fundSize >= 1000000 
              ? `${(fundSize / 1000000).toFixed(2)}M` 
              : fundSize.toLocaleString()}
          </span>
        </div>
        
        <div className="h-5 w-px bg-slate-700" />
        
        <div className="flex items-center gap-1">
          <span className="text-emerald-400 font-mono text-xs">+${incomePerSecond.toFixed(2)}/s</span>
          {doubleIncomeActive && (
            <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded font-bold animate-pulse">
              x2 {formatBoostTime(boostTimeLeft)}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Rep</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                style={{ width: `${reputation}%` }}
              />
            </div>
            <span className="text-white font-semibold text-xs">{reputation}</span>
          </div>
        </div>
        
        <div className={`px-2 py-0.5 rounded text-xs font-bold text-white ${levelColors[careerLevel]}`}>
          {careerLevel}
        </div>
        
        <button
          onClick={useNewClient}
          disabled={newClientUsedToday}
          className={`px-2 py-1 rounded font-semibold text-xs transition-all ${
            newClientUsedToday 
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40"
          }`}
        >
          {newClientUsedToday ? "Tomorrow" : "+ Client"}
        </button>
        
        {onOpenProfile && (
          <button
            onClick={onOpenProfile}
            className="px-2 py-1 rounded font-semibold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            title="Profile"
          >
            Profile
          </button>
        )}
        
        {onOpenShop && (
          <button
            onClick={onOpenShop}
            className="px-2 py-1 rounded font-semibold text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors"
            title="Shop"
          >
            Shop
          </button>
        )}
      </div>
    </div>
  );
}
