import { useAppState } from "@/lib/stores/useAppState";

export default function SettingsModal() {
  const { 
    showSettingsModal, 
    closeSettingsModal, 
    settings, 
    toggleSound, 
    toggleHaptic,
    resetTutorial,
    tutorialCompleted 
  } = useAppState();
  
  if (!showSettingsModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-sm w-full shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-white font-bold text-xl">Settings</h2>
          <button
            onClick={closeSettingsModal}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Sound</span>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.soundEnabled ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              <div 
                className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
                  settings.soundEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white">Haptics</span>
            <button
              onClick={toggleHaptic}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.hapticEnabled ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              <div 
                className={`w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${
                  settings.hapticEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          
          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={resetTutorial}
              disabled={!tutorialCompleted}
              className={`w-full py-2 px-4 rounded font-semibold transition-colors ${
                tutorialCompleted
                  ? "bg-amber-600/20 hover:bg-amber-600/30 text-amber-400"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              Reset Tutorial
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-700">
          <button
            onClick={closeSettingsModal}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
