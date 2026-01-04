import TopBar from "./TopBar";
import MarketPanel from "./MarketPanel";
import TradePanel from "./TradePanel";
import DailyFeed from "./DailyFeed";
import EndOfDayModal from "./EndOfDayModal";
import SettingsMenu from "./SettingsMenu";
import Disclaimer from "./Disclaimer";

export default function GameUI() {
  return (
    <div className="fixed inset-0 flex flex-col pointer-events-auto z-10">
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <MarketPanel />
        </div>
        
        <div className="flex-1" />
        
        <div className="w-56 flex-shrink-0">
          <TradePanel />
        </div>
      </div>
      
      <div className="h-32 flex-shrink-0">
        <DailyFeed />
      </div>
      
      <EndOfDayModal />
      <SettingsMenu />
      <Disclaimer />
    </div>
  );
}
