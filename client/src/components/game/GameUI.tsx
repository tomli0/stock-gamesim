import TopBar from "./TopBar";
import MarketPanel from "./MarketPanel";
import TradePanel from "./TradePanel";
import DailyFeed from "./DailyFeed";
import EndOfDayModal from "./EndOfDayModal";
import SettingsMenu from "./SettingsMenu";
import Disclaimer from "./Disclaimer";
import ResizablePanels from "./ResizablePanels";
import WelcomeBackModal from "./WelcomeBackModal";
import FundIncomePanel from "./FundIncomePanel";
import BoostsPanel from "./BoostsPanel";
import MobileIdlePanel from "./MobileIdlePanel";
import { useIdleGameLoop } from "@/hooks/useIdleGameLoop";

export default function GameUI() {
  useIdleGameLoop();
  
  return (
    <div className="fixed inset-0 flex flex-col pointer-events-auto z-10 overflow-x-hidden">
      <TopBar />
      
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">
          <ResizablePanels
            leftPanel={<MarketPanel />}
            rightPanel={<TradePanel />}
          />
        </div>
        
        <div className="w-56 flex-shrink-0 bg-slate-900/95 border-l border-slate-700 p-2 space-y-2 overflow-y-auto hidden md:block">
          <FundIncomePanel />
          <BoostsPanel />
        </div>
      </div>
      
      <div className="h-32 flex-shrink-0">
        <DailyFeed />
      </div>
      
      <MobileIdlePanel />
      <EndOfDayModal />
      <WelcomeBackModal />
      <SettingsMenu />
      <Disclaimer />
    </div>
  );
}
