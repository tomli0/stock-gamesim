import { useIdleIncome } from "@/lib/stores/useIdleIncome";
import { useStockGame } from "@/lib/stores/useStockGame";
import { useAudio } from "@/lib/stores/useAudio";
import { useState, useEffect } from "react";

export default function FundIncomePanel() {
  const { 
    fundSize, 
    tapBoostPercent, 
    tapBoostMaxPercent,
    getIncomePerSecond,
    tap,
  } = useIdleIncome();
  
  const careerLevel = useStockGame(state => state.getCareerLevel());
  const { playHit } = useAudio();
  
  const [isPressed, setIsPressed] = useState(false);
  const [showTapEffect, setShowTapEffect] = useState(false);
  
  const incomePerSecond = getIncomePerSecond(careerLevel);
  const boostPercent = Math.round(tapBoostPercent);
  
  const handleTap = () => {
    tap();
    playHit();
    setIsPressed(true);
    setShowTapEffect(true);
    
    setTimeout(() => setIsPressed(false), 100);
    setTimeout(() => setShowTapEffect(false), 300);
  };
  
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">Fund Income</h3>
        <div className="text-emerald-400 font-mono text-sm">
          +${incomePerSecond.toFixed(2)}/s
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-slate-400">Fund Size</div>
          <div className="text-white font-semibold">
            ${fundSize >= 1000000 
              ? `${(fundSize / 1000000).toFixed(2)}M` 
              : fundSize.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded p-2">
          <div className="text-slate-400">Tap Boost</div>
          <div className="text-amber-400 font-semibold">+{boostPercent}%</div>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Boost Meter</span>
          <span className="text-slate-400">{boostPercent}/{tapBoostMaxPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-200"
            style={{ width: `${(tapBoostPercent / tapBoostMaxPercent) * 100}%` }}
          />
        </div>
      </div>
      
      <button
        onClick={handleTap}
        className={`w-full py-3 rounded-lg font-bold text-sm transition-all relative overflow-hidden ${
          isPressed 
            ? "bg-amber-600 scale-95" 
            : "bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/30"
        } text-white`}
      >
        <span className="relative z-10">Desk Work</span>
        {showTapEffect && (
          <span className="absolute inset-0 bg-white/30 animate-ping" />
        )}
      </button>
      
      <p className="text-slate-500 text-xs text-center">
        Tap to temporarily boost fund income!
      </p>
    </div>
  );
}
