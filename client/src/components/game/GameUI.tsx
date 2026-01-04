import TopBar from "./TopBar";
import MarketPanel from "./MarketPanel";
import TradePanel from "./TradePanel";
import DailyFeed from "./DailyFeed";
import EndOfDayModal from "./EndOfDayModal";
import SettingsMenu from "./SettingsMenu";
import Disclaimer from "./Disclaimer";
import ResizablePanels from "./ResizablePanels";

export default function GameUI() {
  return (
    <div className="fixed inset-0 flex flex-col pointer-events-auto z-10 overflow-x-hidden">
      <TopBar />
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanels
          leftPanel={<MarketPanel />}
          rightPanel={<TradePanel />}
        />
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
