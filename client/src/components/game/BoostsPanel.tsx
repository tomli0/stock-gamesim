import { useState } from "react";
import { useIdleIncome } from "@/lib/stores/useIdleIncome";
import { useStockGame } from "@/lib/stores/useStockGame";

export default function BoostsPanel() {
  const { 
    rewardedBoosts,
    activateRewardedBoost,
    getBoostTimeRemaining,
    getBoostCooldownRemaining,
    isBoostActive,
    isBoostOnCooldown,
    pendingOfflineEarnings,
    collectOfflineEarnings,
  } = useIdleIncome();
  
  const { cash } = useStockGame();
  
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  
  const handleBoostClick = (boostId: string) => {
    setShowConfirmModal(boostId);
  };
  
  const confirmBoost = (boostId: string) => {
    if (boostId === "instant-collect") {
      const currentPending = pendingOfflineEarnings;
      if (currentPending > 0) {
        const earnings = collectOfflineEarnings();
        useStockGame.setState({ cash: cash + earnings });
        useStockGame.getState().addFeedMessage(`Instant collect: +$${earnings.toLocaleString()}`);
      } else {
        useStockGame.getState().addFeedMessage("No offline earnings to collect right now.");
      }
      activateRewardedBoost(boostId);
    } else {
      activateRewardedBoost(boostId);
      useStockGame.getState().addFeedMessage(`Activated: ${rewardedBoosts.find(b => b.id === boostId)?.name}`);
    }
    setShowConfirmModal(null);
  };
  
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 space-y-3">
      <h3 className="text-white font-bold text-sm">Boosts</h3>
      
      <div className="space-y-2">
        {rewardedBoosts.map((boost) => {
          const active = isBoostActive(boost.id);
          const onCooldown = isBoostOnCooldown(boost.id);
          const timeRemaining = getBoostTimeRemaining(boost.id);
          const cooldownRemaining = getBoostCooldownRemaining(boost.id);
          
          return (
            <div key={boost.id} className="bg-slate-900/50 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-xs font-semibold">{boost.name}</span>
                {active && (
                  <span className="text-emerald-400 text-xs font-mono">
                    {formatTime(timeRemaining)}
                  </span>
                )}
              </div>
              
              <p className="text-slate-500 text-xs mb-2">{boost.description}</p>
              
              {active ? (
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${(timeRemaining / boost.durationMs) * 100}%` }}
                  />
                </div>
              ) : onCooldown ? (
                <button 
                  disabled
                  className="w-full py-1.5 rounded bg-slate-700 text-slate-500 text-xs font-semibold cursor-not-allowed"
                >
                  Cooldown: {formatTime(cooldownRemaining)}
                </button>
              ) : (
                <button
                  onClick={() => handleBoostClick(boost.id)}
                  className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                >
                  Watch Ad
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-xs w-full shadow-2xl p-4">
            <h4 className="text-white font-bold mb-2">Watch Ad?</h4>
            <p className="text-slate-400 text-sm mb-4">
              Simulate watching an ad to activate this boost?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmBoost(showConfirmModal)}
                className="flex-1 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
              >
                Simulate Watch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
