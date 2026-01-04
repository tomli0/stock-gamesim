import { useRef, useEffect } from "react";
import { useStockGame } from "@/lib/stores/useStockGame";

export default function DailyFeed() {
  const { feedMessages, endDay } = useStockGame();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedMessages]);
  
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 h-full flex flex-col">
      <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-white font-bold text-sm">Daily Feed</h2>
        <button
          onClick={endDay}
          className="end-day-button bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-1 px-3 rounded transition-colors"
        >
          End Day
        </button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {feedMessages.map((message, index) => (
          <div 
            key={index} 
            className={`text-xs ${
              message.startsWith("---") 
                ? "text-blue-400 font-bold mt-2" 
                : message.includes("Bought") 
                  ? "text-green-400"
                  : message.includes("Sold")
                    ? "text-amber-400"
                    : message.includes("New client")
                      ? "text-emerald-400"
                      : "text-slate-400"
            }`}
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}
