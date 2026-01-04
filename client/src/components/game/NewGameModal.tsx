import { useAppState } from "@/lib/stores/useAppState";
import { useStockGame } from "@/lib/stores/useStockGame";

export default function NewGameModal() {
  const { showNewGameModal, closeNewGameModal, setScreen } = useAppState();
  const { resetGame, initTutorialMode, disableTutorialMode } = useStockGame();
  
  if (!showNewGameModal) return null;

  const handleConfirm = () => {
    disableTutorialMode();
    resetGame();
    closeNewGameModal();
    setScreen("game");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-sm w-full shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-white font-bold text-xl">Start New Game?</h2>
        </div>
        
        <div className="p-6">
          <p className="text-slate-300 text-sm">
            This will overwrite your current save and start fresh from Day 1 with $100,000.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Your progress, positions, and reputation will be reset.
          </p>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-700 flex gap-3">
          <button
            onClick={closeNewGameModal}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Start New
          </button>
        </div>
      </div>
    </div>
  );
}
