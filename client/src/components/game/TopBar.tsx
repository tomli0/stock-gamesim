import { useStockGame } from "@/lib/stores/useStockGame";

export default function TopBar() {
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

  const careerLevel = getCareerLevel();
  const portfolioValue = getPortfolioValue();
  const totalValue = getTotalValue();

  const levelColors: Record<string, string> = {
    Junior: "bg-gray-500",
    Associate: "bg-blue-500",
    Senior: "bg-purple-500",
    Partner: "bg-amber-500",
  };

  return (
    <div className="top-bar bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Day</span>
          <span className="text-white font-bold text-lg">{day}</span>
        </div>
        
        <div className="h-6 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Cash</span>
          <span className="text-green-400 font-semibold">${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="h-6 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Portfolio</span>
          <span className="text-blue-400 font-semibold">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="h-6 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Total</span>
          <span className="text-white font-bold">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Reputation</span>
          <div className="flex items-center gap-1">
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                style={{ width: `${reputation}%` }}
              />
            </div>
            <span className="text-white font-semibold text-sm">{reputation}</span>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded text-xs font-bold text-white ${levelColors[careerLevel]}`}>
          {careerLevel}
        </div>
        
        <button
          onClick={useNewClient}
          disabled={newClientUsedToday}
          className={`px-3 py-1.5 rounded font-semibold text-sm transition-all ${
            newClientUsedToday 
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40"
          }`}
        >
          {newClientUsedToday ? "Available Tomorrow" : "+ New Client"}
        </button>
      </div>
    </div>
  );
}
