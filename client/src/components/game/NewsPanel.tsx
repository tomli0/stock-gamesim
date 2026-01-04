import { useStockGame, NewsItem } from "@/lib/stores/useStockGame";

function NewsCard({ item }: { item: NewsItem }) {
  const getBadgeColor = () => {
    switch (item.type) {
      case "company": return "bg-blue-600";
      case "sector": return "bg-purple-600";
      case "macro": return "bg-amber-600";
    }
  };
  
  const getBadgeLabel = () => {
    switch (item.type) {
      case "company": return "Company";
      case "sector": return "Sector";
      case "macro": return "Economy";
    }
  };
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <span className={`${getBadgeColor()} text-white text-xs px-2 py-0.5 rounded font-medium`}>
          {getBadgeLabel()}
        </span>
        <span className="text-slate-500 text-xs">{item.category}</span>
        <span className="text-slate-600 text-xs ml-auto">Morning Brief</span>
      </div>
      
      <h3 className="text-white font-semibold text-sm mb-1">
        {item.headline}
      </h3>
      
      <p className="text-slate-400 text-xs leading-relaxed">
        {item.body}
      </p>
      
      {item.affectedTickers && item.affectedTickers.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.affectedTickers.map(ticker => (
            <span key={ticker} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
              {ticker}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function QuietDayMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="text-slate-500 text-2xl mb-2">📰</div>
      <h3 className="text-slate-400 font-medium text-sm mb-1">Quiet Day</h3>
      <p className="text-slate-500 text-xs">No major headlines today.</p>
    </div>
  );
}

export default function NewsPanel() {
  const { dailyNews, showEndOfDayModal } = useStockGame();
  
  const hasNews = dailyNews.length > 0;
  
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg h-full flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-white font-bold text-sm">News</h2>
        {hasNews && (
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            {dailyNews.length}
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {showEndOfDayModal && hasNews ? (
          dailyNews.map(item => (
            <NewsCard key={item.id} item={item} />
          ))
        ) : showEndOfDayModal ? (
          <QuietDayMessage />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm text-center">
            News will appear after ending the day.
          </div>
        )}
      </div>
    </div>
  );
}
