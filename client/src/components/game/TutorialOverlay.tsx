import { useAppState } from "@/lib/stores/useAppState";
import { useStockGame } from "@/lib/stores/useStockGame";
import { useEffect } from "react";

interface TutorialStep {
  title: string;
  description: string;
  highlightSelector: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  waitForAction?: "buy" | "endDay" | "selectStock" | "nextDay";
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to Market Desk!",
    description: "This is your trading desk. Let's learn how to manage your stock portfolio. Look at the top bar - it shows your Day number, Cash, Portfolio value, Total assets, Reputation, and Career Level.",
    highlightSelector: ".top-bar",
    position: "bottom",
  },
  {
    title: "The Market Panel",
    description: "On the left, you'll see all available stocks. Each shows the ticker symbol, company name, current price, and daily change. Click on any stock to see more details.",
    highlightSelector: ".market-panel",
    position: "right",
    waitForAction: "selectStock",
  },
  {
    title: "Stock Details & Trading",
    description: "Great! Here you can see the stock's price, a 30-day chart, and your current position. The chart shows how the price has moved over time.",
    highlightSelector: ".trade-panel",
    position: "left",
  },
  {
    title: "Place Your First Trade",
    description: "Let's buy some shares! Set the quantity to at least 5 and press the Buy button. This will add the stock to your portfolio.",
    highlightSelector: ".trade-controls",
    position: "left",
    waitForAction: "buy",
  },
  {
    title: "Your Position",
    description: "Excellent! You now own shares in this company. The 'Your Position' section shows how many shares you own, your average cost, current value, and unrealized profit/loss.",
    highlightSelector: ".position-info",
    position: "left",
  },
  {
    title: "End the Trading Day",
    description: "When you're ready, click 'End Day' in the Daily Feed panel. Prices will update based on market conditions and news events.",
    highlightSelector: ".end-day-button",
    position: "top",
    waitForAction: "endDay",
  },
  {
    title: "Daily Summary",
    description: "This shows your daily profit/loss, best and worst performing stocks, and how your reputation changed. Reputation affects your career level and how much capital new clients bring!",
    highlightSelector: ".end-of-day-modal",
    position: "center",
    waitForAction: "nextDay",
  },
  {
    title: "Tutorial Complete!",
    description: "You've learned the basics! Keep trading to build your portfolio, grow your reputation, and advance your career from Junior to Partner. Good luck!",
    highlightSelector: "",
    position: "center",
  },
];

export default function TutorialOverlay() {
  const { screen, tutorialStep, nextTutorialStep, skipTutorial, completeTutorial } = useAppState();
  const { selectedTicker, positions, showEndOfDayModal, day, initTutorialMode, disableTutorialMode, resetGame } = useStockGame();
  
  useEffect(() => {
    if (screen === "tutorial") {
      initTutorialMode();
    }
  }, [screen, initTutorialMode]);
  
  if (screen !== "tutorial") return null;
  
  const currentStep = TUTORIAL_STEPS[tutorialStep];
  if (!currentStep) {
    disableTutorialMode();
    resetGame();
    completeTutorial();
    return null;
  }
  
  const canProceed = () => {
    switch (currentStep.waitForAction) {
      case "selectStock":
        return selectedTicker !== null;
      case "buy":
        return positions.length > 0;
      case "endDay":
        return showEndOfDayModal;
      case "nextDay":
        return day > 1;
      default:
        return true;
    }
  };
  
  const handleNext = () => {
    if (tutorialStep >= TUTORIAL_STEPS.length - 1) {
      disableTutorialMode();
      resetGame();
      completeTutorial();
    } else {
      nextTutorialStep();
    }
  };
  
  const handleSkip = () => {
    disableTutorialMode();
    resetGame();
    skipTutorial();
  };
  
  const isLastStep = tutorialStep >= TUTORIAL_STEPS.length - 1;
  const waitingForAction = currentStep.waitForAction && !canProceed();
  
  const getTooltipPosition = () => {
    switch (currentStep.position) {
      case "top":
        return "top-20 left-1/2 -translate-x-1/2";
      case "bottom":
        return "bottom-40 left-1/2 -translate-x-1/2";
      case "left":
        return "top-1/2 left-72 -translate-y-1/2";
      case "right":
        return "top-1/2 right-64 -translate-y-1/2";
      case "center":
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />
      
      <div className={`absolute ${getTooltipPosition()} bg-slate-900 border border-blue-500 rounded-lg p-6 max-w-sm shadow-2xl shadow-blue-500/20 pointer-events-auto z-[70]`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-blue-400 font-medium">
            Step {tutorialStep + 1} of {TUTORIAL_STEPS.length}
          </span>
        </div>
        
        <h3 className="text-white font-bold text-lg mb-2">
          {currentStep.title}
        </h3>
        
        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
          {currentStep.description}
        </p>
        
        {waitingForAction && (
          <p className="text-amber-400 text-xs mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Complete the action to continue...
          </p>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded font-medium text-sm transition-colors"
          >
            Skip Tutorial
          </button>
          
          <button
            onClick={handleNext}
            disabled={waitingForAction}
            className={`flex-1 py-2 px-4 rounded font-bold text-sm transition-colors ${
              waitingForAction
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
