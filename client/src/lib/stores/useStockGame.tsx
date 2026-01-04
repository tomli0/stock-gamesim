import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  previousPrice: number;
  volatility: number;
  priceHistory: number[];
}

export interface Position {
  ticker: string;
  shares: number;
  avgCost: number;
}

export interface NewsItem {
  id: string;
  text: string;
  type: "macro" | "sector" | "company";
  affectedTickers?: string[];
  modifier?: number;
}

export type CareerLevel = "Junior" | "Associate" | "Senior" | "Partner";

export interface GameState {
  day: number;
  cash: number;
  positions: Position[];
  stocks: Stock[];
  reputation: number;
  newClientUsedToday: boolean;
  dailyNews: NewsItem[];
  feedMessages: string[];
  selectedTicker: string | null;
  showEndOfDayModal: boolean;
  dailyPnL: number;
  totalRealizedPnL: number;
  tutorialMode: boolean;
  tutorialTicker: string | null;
  
  getCareerLevel: () => CareerLevel;
  getPortfolioValue: () => number;
  getTotalValue: () => number;
  getPosition: (ticker: string) => Position | undefined;
  
  selectStock: (ticker: string | null) => void;
  buyStock: (ticker: string, quantity: number) => boolean;
  sellStock: (ticker: string, quantity: number) => boolean;
  useNewClient: () => void;
  endDay: () => void;
  startNewDay: () => void;
  resetGame: () => void;
  addFeedMessage: (message: string) => void;
  initTutorialMode: () => void;
  disableTutorialMode: () => void;
}

const INITIAL_STOCKS: Stock[] = [
  { ticker: "NLSY", name: "Nordlite Systems", sector: "Technology", price: 87.50, previousPrice: 87.50, volatility: 0.03, priceHistory: [] },
  { ticker: "VCLD", name: "Vanta Cloudworks", sector: "Technology", price: 142.25, previousPrice: 142.25, volatility: 0.035, priceHistory: [] },
  { ticker: "KFRG", name: "Kernel Forge", sector: "Technology", price: 65.80, previousPrice: 65.80, volatility: 0.04, priceHistory: [] },
  { ticker: "HLBG", name: "Halberg Industries", sector: "Industrial", price: 98.40, previousPrice: 98.40, volatility: 0.025, priceHistory: [] },
  { ticker: "AGCO", name: "Aurora Grid Co", sector: "Utilities", price: 45.20, previousPrice: 45.20, volatility: 0.015, priceHistory: [] },
  { ticker: "SLVX", name: "Solvex Materials", sector: "Materials", price: 178.90, previousPrice: 178.90, volatility: 0.032, priceHistory: [] },
  { ticker: "BHFN", name: "Bronze Harbor Finance", sector: "Finance", price: 52.30, previousPrice: 52.30, volatility: 0.022, priceHistory: [] },
  { ticker: "MBPY", name: "Mintbridge Payments", sector: "Finance", price: 124.60, previousPrice: 124.60, volatility: 0.028, priceHistory: [] },
  { ticker: "OIGR", name: "Orchard Insure Group", sector: "Finance", price: 38.75, previousPrice: 38.75, volatility: 0.018, priceHistory: [] },
  { ticker: "CRMD", name: "Cirrus Medical", sector: "Healthcare", price: 215.40, previousPrice: 215.40, volatility: 0.03, priceHistory: [] },
  { ticker: "FJFF", name: "Fjord Fresh Foods", sector: "Consumer", price: 28.90, previousPrice: 28.90, volatility: 0.02, priceHistory: [] },
  { ticker: "LRLB", name: "Lumina Retail Labs", sector: "Technology", price: 76.35, previousPrice: 76.35, volatility: 0.033, priceHistory: [] },
  { ticker: "SHMB", name: "Skyharbor Mobility", sector: "Transportation", price: 94.20, previousPrice: 94.20, volatility: 0.035, priceHistory: [] },
  { ticker: "TWSH", name: "Tideway Shipping", sector: "Transportation", price: 42.15, previousPrice: 42.15, volatility: 0.025, priceHistory: [] },
  { ticker: "PNTL", name: "Pinnacle Telecom", sector: "Telecom", price: 56.80, previousPrice: 56.80, volatility: 0.015, priceHistory: [] },
];

const MACRO_NEWS = [
  "Central bank signals potential rate adjustment in coming months.",
  "Inflation data comes in slightly above expectations.",
  "Economic growth remains steady according to latest reports.",
  "Labor market shows resilience despite global headwinds.",
  "Consumer confidence index rises for third consecutive month.",
  "Trade negotiations between major economies continue.",
  "Currency markets remain stable amid policy discussions.",
  "Quarterly GDP figures meet analyst expectations.",
];

const SECTOR_NEWS: Record<string, { news: string; modifier: number }[]> = {
  Technology: [
    { news: "New cybersecurity regulations boost tech sector spending.", modifier: 0.02 },
    { news: "Cloud adoption accelerates across enterprise clients.", modifier: 0.015 },
    { news: "Tech sector faces headwinds from supply chain concerns.", modifier: -0.02 },
  ],
  Finance: [
    { news: "Banking sector sees increased lending activity.", modifier: 0.015 },
    { news: "Financial services benefit from rising interest rates.", modifier: 0.018 },
    { news: "Regulatory scrutiny increases for payment processors.", modifier: -0.015 },
  ],
  Healthcare: [
    { news: "Medical device approvals accelerate globally.", modifier: 0.02 },
    { news: "Healthcare spending projected to increase next quarter.", modifier: 0.015 },
  ],
  Transportation: [
    { news: "Shipping rates stabilize after recent volatility.", modifier: 0.01 },
    { news: "Fuel costs pressure transportation margins.", modifier: -0.018 },
    { news: "Urban mobility solutions gain municipal support.", modifier: 0.02 },
  ],
  Utilities: [
    { news: "Power grid investments receive government backing.", modifier: 0.012 },
    { news: "Renewable energy transition creates opportunities.", modifier: 0.015 },
  ],
  Materials: [
    { news: "Battery material demand surges with EV growth.", modifier: 0.025 },
    { news: "Raw material costs pressure margins industry-wide.", modifier: -0.015 },
  ],
  Consumer: [
    { news: "Consumer spending remains resilient.", modifier: 0.01 },
    { news: "Food sector benefits from stable commodity prices.", modifier: 0.012 },
  ],
  Industrial: [
    { news: "Factory automation investments continue to grow.", modifier: 0.018 },
    { news: "Manufacturing sector shows mixed results.", modifier: -0.01 },
  ],
  Telecom: [
    { news: "Telecom infrastructure spending remains stable.", modifier: 0.008 },
    { news: "5G rollout continues to drive subscriber growth.", modifier: 0.012 },
  ],
};

const COMPANY_NEWS: Record<string, { news: string; modifier: number }[]> = {
  NLSY: [
    { news: "Nordlite Systems wins major logistics contract.", modifier: 0.04 },
    { news: "Nordlite faces integration challenges with new platform.", modifier: -0.025 },
  ],
  VCLD: [
    { news: "Vanta Cloudworks reports record enterprise signups.", modifier: 0.035 },
    { news: "Cloud outage impacts Vanta Cloudworks reputation.", modifier: -0.03 },
  ],
  KFRG: [
    { news: "Kernel Forge secures government cybersecurity deal.", modifier: 0.045 },
    { news: "Kernel Forge faces competition from new entrants.", modifier: -0.02 },
  ],
  HLBG: [
    { news: "Halberg Industries expands manufacturing capacity.", modifier: 0.03 },
  ],
  AGCO: [
    { news: "Aurora Grid Co wins regional utility contract.", modifier: 0.025 },
  ],
  SLVX: [
    { news: "Solvex Materials announces breakthrough in battery tech.", modifier: 0.05 },
    { news: "Solvex faces supply chain disruptions.", modifier: -0.03 },
  ],
  CRMD: [
    { news: "Cirrus Medical receives FDA clearance for new device.", modifier: 0.04 },
    { news: "Cirrus Medical faces recall concerns.", modifier: -0.035 },
  ],
  SHMB: [
    { news: "Skyharbor Mobility expands to new metropolitan areas.", modifier: 0.03 },
  ],
  TWSH: [
    { news: "Tideway Shipping benefits from increased cargo volume.", modifier: 0.025 },
  ],
};

function initializeStocks(): Stock[] {
  return INITIAL_STOCKS.map(stock => ({
    ...stock,
    priceHistory: Array(30).fill(0).map((_, i) => {
      const variance = (Math.random() - 0.5) * stock.volatility * stock.price * 2;
      return Math.max(1, stock.price + variance * (i - 15) / 15);
    }),
  }));
}

function generateDailyNews(stocks: Stock[]): { news: NewsItem[], modifiers: Map<string, number> } {
  const news: NewsItem[] = [];
  const modifiers = new Map<string, number>();
  
  if (Math.random() < 0.7) {
    const macroNews = MACRO_NEWS[Math.floor(Math.random() * MACRO_NEWS.length)];
    news.push({
      id: `macro-${Date.now()}`,
      text: macroNews,
      type: "macro",
    });
  }
  
  const sectors = Array.from(new Set(stocks.map(s => s.sector)));
  if (Math.random() < 0.5) {
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const sectorNewsList = SECTOR_NEWS[sector];
    if (sectorNewsList && sectorNewsList.length > 0) {
      const selected = sectorNewsList[Math.floor(Math.random() * sectorNewsList.length)];
      const affectedTickers = stocks.filter(s => s.sector === sector).map(s => s.ticker);
      news.push({
        id: `sector-${Date.now()}`,
        text: selected.news,
        type: "sector",
        affectedTickers,
        modifier: selected.modifier,
      });
      affectedTickers.forEach(t => {
        modifiers.set(t, (modifiers.get(t) || 0) + selected.modifier);
      });
    }
  }
  
  const numCompanyNews = Math.random() < 0.4 ? (Math.random() < 0.5 ? 1 : 2) : 0;
  const usedTickers = new Set<string>();
  for (let i = 0; i < numCompanyNews; i++) {
    const tickersWithNews = Object.keys(COMPANY_NEWS).filter(t => !usedTickers.has(t));
    if (tickersWithNews.length === 0) break;
    const ticker = tickersWithNews[Math.floor(Math.random() * tickersWithNews.length)];
    usedTickers.add(ticker);
    const companyNewsList = COMPANY_NEWS[ticker];
    if (companyNewsList && companyNewsList.length > 0) {
      const selected = companyNewsList[Math.floor(Math.random() * companyNewsList.length)];
      news.push({
        id: `company-${ticker}-${Date.now()}`,
        text: selected.news,
        type: "company",
        affectedTickers: [ticker],
        modifier: selected.modifier,
      });
      modifiers.set(ticker, (modifiers.get(ticker) || 0) + selected.modifier);
    }
  }
  
  return { news, modifiers };
}

function updateStockPrices(stocks: Stock[], modifiers: Map<string, number>): Stock[] {
  return stocks.map(stock => {
    const baseReturn = (Math.random() - 0.5) * 2 * stock.volatility;
    const eventModifier = modifiers.get(stock.ticker) || 0;
    const totalReturn = baseReturn + eventModifier;
    
    const newPrice = Math.max(1, stock.price * (1 + totalReturn));
    const roundedPrice = Math.round(newPrice * 100) / 100;
    
    const newHistory = [...stock.priceHistory.slice(1), roundedPrice];
    
    return {
      ...stock,
      previousPrice: stock.price,
      price: roundedPrice,
      priceHistory: newHistory,
    };
  });
}

function getCareerLevelFromRep(rep: number): CareerLevel {
  if (rep >= 90) return "Partner";
  if (rep >= 75) return "Senior";
  if (rep >= 60) return "Associate";
  return "Junior";
}

function getNewClientAmount(level: CareerLevel): number {
  switch (level) {
    case "Partner": return 5000000;
    case "Senior": return 1000000;
    case "Associate": return 250000;
    case "Junior": return 50000;
  }
}

const STORAGE_KEY = "stock-broker-game-save";

function loadSavedState(): Partial<GameState> | null {
  const saved = getLocalStorage(STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
}

function saveState(state: Partial<GameState>) {
  setLocalStorage(STORAGE_KEY, {
    day: state.day,
    cash: state.cash,
    positions: state.positions,
    stocks: state.stocks,
    reputation: state.reputation,
    newClientUsedToday: state.newClientUsedToday,
    totalRealizedPnL: state.totalRealizedPnL,
  });
}

export const useStockGame = create<GameState>()(
  subscribeWithSelector((set, get) => {
    const savedState = loadSavedState();
    const initialStocks = savedState?.stocks || initializeStocks();
    
    return {
      day: savedState?.day || 1,
      cash: savedState?.cash || 100000,
      positions: savedState?.positions || [],
      stocks: initialStocks,
      reputation: savedState?.reputation || 50,
      newClientUsedToday: savedState?.newClientUsedToday || false,
      dailyNews: [],
      feedMessages: ["Welcome to your trading desk. Good luck!"],
      selectedTicker: null,
      showEndOfDayModal: false,
      dailyPnL: 0,
      totalRealizedPnL: savedState?.totalRealizedPnL || 0,
      tutorialMode: false,
      tutorialTicker: null,
      
      getCareerLevel: () => getCareerLevelFromRep(get().reputation),
      
      getPortfolioValue: () => {
        const { positions, stocks } = get();
        return positions.reduce((total, pos) => {
          const stock = stocks.find(s => s.ticker === pos.ticker);
          return total + (stock ? pos.shares * stock.price : 0);
        }, 0);
      },
      
      getTotalValue: () => {
        return get().cash + get().getPortfolioValue();
      },
      
      getPosition: (ticker: string) => {
        return get().positions.find(p => p.ticker === ticker);
      },
      
      selectStock: (ticker) => set({ selectedTicker: ticker }),
      
      buyStock: (ticker, quantity) => {
        const { cash, positions, stocks } = get();
        const stock = stocks.find(s => s.ticker === ticker);
        if (!stock || quantity <= 0) return false;
        
        const cost = stock.price * quantity;
        if (cost > cash) return false;
        
        const existingPos = positions.find(p => p.ticker === ticker);
        let newPositions: Position[];
        
        if (existingPos) {
          const totalShares = existingPos.shares + quantity;
          const totalCost = existingPos.shares * existingPos.avgCost + cost;
          const newAvgCost = totalCost / totalShares;
          newPositions = positions.map(p => 
            p.ticker === ticker 
              ? { ...p, shares: totalShares, avgCost: Math.round(newAvgCost * 100) / 100 }
              : p
          );
        } else {
          newPositions = [...positions, { ticker, shares: quantity, avgCost: stock.price }];
        }
        
        set({ 
          cash: Math.round((cash - cost) * 100) / 100, 
          positions: newPositions,
          feedMessages: [...get().feedMessages, `Bought ${quantity} shares of ${ticker} at $${stock.price.toFixed(2)}`]
        });
        saveState(get());
        return true;
      },
      
      sellStock: (ticker, quantity) => {
        const { cash, positions, stocks, totalRealizedPnL } = get();
        const stock = stocks.find(s => s.ticker === ticker);
        const position = positions.find(p => p.ticker === ticker);
        
        if (!stock || !position || quantity <= 0 || quantity > position.shares) return false;
        
        const proceeds = stock.price * quantity;
        const costBasis = position.avgCost * quantity;
        const realizedPnL = proceeds - costBasis;
        
        let newPositions: Position[];
        if (position.shares === quantity) {
          newPositions = positions.filter(p => p.ticker !== ticker);
        } else {
          newPositions = positions.map(p =>
            p.ticker === ticker
              ? { ...p, shares: p.shares - quantity }
              : p
          );
        }
        
        set({
          cash: Math.round((cash + proceeds) * 100) / 100,
          positions: newPositions,
          totalRealizedPnL: Math.round((totalRealizedPnL + realizedPnL) * 100) / 100,
          feedMessages: [...get().feedMessages, `Sold ${quantity} shares of ${ticker} at $${stock.price.toFixed(2)} (P/L: $${realizedPnL.toFixed(2)})`]
        });
        saveState(get());
        return true;
      },
      
      useNewClient: () => {
        const { newClientUsedToday, cash } = get();
        if (newClientUsedToday) return;
        
        const level = get().getCareerLevel();
        const amount = getNewClientAmount(level);
        
        set({
          cash: cash + amount,
          newClientUsedToday: true,
          feedMessages: [...get().feedMessages, `New client onboarded. Capital added: $${amount.toLocaleString()}`]
        });
        saveState(get());
      },
      
      endDay: () => {
        const { stocks, positions, cash, tutorialMode, tutorialTicker } = get();
        
        const previousValue = positions.reduce((total, pos) => {
          const stock = stocks.find(s => s.ticker === pos.ticker);
          return total + (stock ? pos.shares * stock.previousPrice : 0);
        }, 0) + cash;
        
        const { news, modifiers } = generateDailyNews(stocks);
        
        if (tutorialMode && tutorialTicker) {
          const tutorialBoost = 0.02 + Math.random() * 0.04;
          modifiers.set(tutorialTicker, (modifiers.get(tutorialTicker) || 0) + tutorialBoost);
        }
        
        const updatedStocks = updateStockPrices(stocks, modifiers);
        
        const currentValue = positions.reduce((total, pos) => {
          const stock = updatedStocks.find(s => s.ticker === pos.ticker);
          return total + (stock ? pos.shares * stock.price : 0);
        }, 0) + cash;
        
        const dailyPnL = currentValue - previousValue;
        
        let repChange = 0;
        if (dailyPnL > 0) {
          repChange = Math.min(3, Math.max(1, Math.floor(dailyPnL / 5000)));
        } else if (dailyPnL < 0) {
          repChange = Math.max(-3, Math.min(-1, Math.ceil(dailyPnL / 5000)));
        }
        
        const newRep = Math.max(0, Math.min(100, get().reputation + repChange));
        
        set({
          stocks: updatedStocks,
          dailyPnL: Math.round(dailyPnL * 100) / 100,
          reputation: newRep,
          showEndOfDayModal: true,
          dailyNews: news,
        });
        if (!tutorialMode) {
          saveState(get());
        }
      },
      
      startNewDay: () => {
        const { dailyNews } = get();
        const newsMessages = dailyNews.map(n => n.text);
        
        set({
          day: get().day + 1,
          showEndOfDayModal: false,
          newClientUsedToday: false,
          feedMessages: ["--- New Trading Day ---", ...newsMessages],
        });
        saveState(get());
      },
      
      resetGame: () => {
        localStorage.removeItem(STORAGE_KEY);
        const freshStocks = initializeStocks();
        set({
          day: 1,
          cash: 100000,
          positions: [],
          stocks: freshStocks,
          reputation: 50,
          newClientUsedToday: false,
          dailyNews: [],
          feedMessages: ["Game reset. Welcome back to your trading desk!"],
          selectedTicker: null,
          showEndOfDayModal: false,
          dailyPnL: 0,
          totalRealizedPnL: 0,
        });
      },
      
      addFeedMessage: (message) => {
        set({ feedMessages: [...get().feedMessages, message] });
      },
      
      initTutorialMode: () => {
        const freshStocks = initializeStocks();
        set({
          day: 1,
          cash: 100000,
          positions: [],
          stocks: freshStocks,
          reputation: 50,
          newClientUsedToday: false,
          dailyNews: [],
          feedMessages: ["Welcome to the tutorial! Let's learn how to trade."],
          selectedTicker: null,
          showEndOfDayModal: false,
          dailyPnL: 0,
          totalRealizedPnL: 0,
          tutorialMode: true,
          tutorialTicker: "NLSY",
        });
      },
      
      disableTutorialMode: () => {
        set({ tutorialMode: false, tutorialTicker: null });
      },
    };
  })
);
