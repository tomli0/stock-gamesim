import { useEffect, useState } from "react";
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
import ShopScreen from "./ShopScreen";
import ProfileScreen from "./ProfileScreen";
import { useIdleGameLoop } from "@/hooks/useIdleGameLoop";
import { useStockGame } from "@/lib/stores/useStockGame";

type ActiveScreen = "game" | "shop" | "profile";

export default function GameUI() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("game");
  const tickDayTimer = useStockGame(state => state.tickDayTimer);
  
  useIdleGameLoop();
  
  useEffect(() => {
    const interval = setInterval(() => {
      tickDayTimer();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [tickDayTimer]);
  
  if (activeScreen === "shop") {
    return <ShopScreen onClose={() => setActiveScreen("game")} />;
  }
  
  if (activeScreen === "profile") {
    return <ProfileScreen onClose={() => setActiveScreen("game")} />;
  }
  
  return (
    <div className="fixed inset-0 flex flex-col pointer-events-auto z-10 overflow-x-hidden">
      <TopBar 
        onOpenShop={() => setActiveScreen("shop")}
        onOpenProfile={() => setActiveScreen("profile")}
      />
      
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
