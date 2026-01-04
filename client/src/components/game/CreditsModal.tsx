import { useAppState } from "@/lib/stores/useAppState";

export default function CreditsModal() {
  const { showCreditsModal, closeCreditsModal } = useAppState();
  
  if (!showCreditsModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-sm w-full shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-white font-bold text-xl">Credits</h2>
          <button
            onClick={closeCreditsModal}
            className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-center">
          <div className="text-5xl mb-4">📈</div>
          
          <h3 className="text-white font-bold text-lg">Market Desk Simulator</h3>
          
          <p className="text-slate-400 text-sm">
            A fictional stock broker simulation game where you build your portfolio day by day.
          </p>
          
          <div className="pt-4 border-t border-slate-700">
            <p className="text-slate-500 text-xs">
              All companies, tickers, and market data in this game are entirely fictional and created for entertainment purposes only.
            </p>
          </div>
          
          <div className="pt-4">
            <p className="text-slate-600 text-xs">
              Built with React, Three.js, and Zustand
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-700">
          <button
            onClick={closeCreditsModal}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
