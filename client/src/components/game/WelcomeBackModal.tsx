import { useIdleIncome } from "@/lib/stores/useIdleIncome";
import { useStockGame } from "@/lib/stores/useStockGame";

export default function WelcomeBackModal() {
  const { showWelcomeBackModal, pendingOfflineEarnings, collectOfflineEarnings } = useIdleIncome();
  const { cash } = useStockGame();
  
  if (!showWelcomeBackModal || pendingOfflineEarnings <= 0) return null;
  
  const handleCollect = () => {
    const earnings = collectOfflineEarnings();
    useStockGame.setState({ cash: cash + earnings });
    useStockGame.getState().addFeedMessage(`Collected $${earnings.toLocaleString()} in offline fund earnings`);
  };
  
  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  const offlineTime = Date.now() - useIdleIncome.getState().lastActiveTimestamp;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-sm w-full shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-emerald-900/50 to-slate-900">
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            Welcome Back!
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-slate-300">
            Your fund has been working while you were away for <span className="text-white font-semibold">{formatDuration(offlineTime)}</span>.
          </p>
          
          <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-lg p-4 text-center">
            <div className="text-slate-400 text-sm mb-1">Earnings Collected</div>
            <div className="text-3xl font-bold text-emerald-400">
              +${pendingOfflineEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <p className="text-slate-500 text-xs text-center">
            Tip: Higher career levels and Fund Size increase offline earnings!
          </p>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-700">
          <button
            onClick={handleCollect}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-emerald-600/30"
          >
            Collect Earnings
          </button>
        </div>
      </div>
    </div>
  );
}
