import { useAppState } from "@/lib/stores/useAppState";
import { useStockGame } from "@/lib/stores/useStockGame";

export default function TitleScreen() {
  const { 
    setScreen, 
    startTutorial, 
    openSettingsModal, 
    openCreditsModal, 
    openNewGameModal,
    hasSave 
  } = useAppState();
  
  const saveExists = hasSave();

  const handleContinue = () => {
    setScreen("game");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-lg">
        <div className="mb-2">
          <span className="text-6xl">📈</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          Market Desk
        </h1>
        <h2 className="text-lg md:text-xl text-slate-400 mb-12">
          A fictional broker day-by-day portfolio simulator
        </h2>
        
        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <button
            onClick={handleContinue}
            disabled={!saveExists}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
              saveExists
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
          
          <button
            onClick={openNewGameModal}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-lg shadow-lg shadow-emerald-600/30 transition-all"
          >
            New Game
          </button>
          
          <button
            onClick={startTutorial}
            className="w-full py-4 px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-lg shadow-lg shadow-amber-600/30 transition-all"
          >
            Tutorial
          </button>
          
          <div className="flex gap-3 mt-2">
            <button
              onClick={openSettingsModal}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
            >
              Settings
            </button>
            
            <button
              onClick={openCreditsModal}
              className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
            >
              Credits
            </button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-slate-500 text-sm px-4">
          All companies and market data are fictional.
        </p>
      </div>
    </div>
  );
}
