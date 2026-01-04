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
  headline: string;
  body: string;
  type: "macro" | "sector" | "company";
  category: string;
  affectedTickers?: string[];
  affectedSector?: string;
}

export interface NewsEffect {
  id: string;
  type: "company" | "sector" | "macro";
  target: string;
  direction: "positive" | "negative";
  strength: "small" | "medium" | "large";
  daysRemaining: number;
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
  activeNewsEffects: NewsEffect[];
  hadNewsToday: boolean;
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
  spendCash: (amount: number, reason?: string) => boolean;
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

interface NewsTemplate {
  headline: string;
  body: string;
  direction: "positive" | "negative";
  strength: "small" | "medium" | "large";
}

const MACRO_NEWS: NewsTemplate[] = [
  { headline: "Central Bank Signals Rate Adjustment", body: "Officials indicated potential monetary policy changes in coming months. Markets are closely watching for further guidance on interest rate direction.", direction: "positive", strength: "small" },
  { headline: "Inflation Data Above Expectations", body: "The latest consumer price index came in higher than analysts predicted. Economic observers are reassessing growth projections for the quarter.", direction: "negative", strength: "small" },
  { headline: "Strong Economic Growth Reported", body: "GDP figures exceeded forecasts, showing resilient consumer spending and business investment. Analysts view this as a positive sign for corporate earnings.", direction: "positive", strength: "medium" },
  { headline: "Labor Market Shows Resilience", body: "Employment data remains steady despite global economic headwinds. Job creation continues across multiple sectors.", direction: "positive", strength: "small" },
  { headline: "Consumer Confidence Rises", body: "The consumer confidence index increased for the third consecutive month. Retail and consumer-facing sectors may see increased activity.", direction: "positive", strength: "small" },
  { headline: "Trade Tensions Ease Between Nations", body: "Diplomatic progress was reported in ongoing trade negotiations. Supply chain constraints may improve in coming months.", direction: "positive", strength: "medium" },
  { headline: "Currency Markets See Volatility", body: "Exchange rate fluctuations have increased amid policy uncertainty. International companies may face margin pressure.", direction: "negative", strength: "small" },
];

const SECTOR_NEWS: Record<string, NewsTemplate[]> = {
  Technology: [
    { headline: "Cybersecurity Regulations Expand", body: "New government mandates require enhanced security measures for enterprise systems. Companies in the space are seeing increased demand for solutions.", direction: "positive", strength: "medium" },
    { headline: "Cloud Adoption Accelerates", body: "Enterprise migration to cloud infrastructure continues at a rapid pace. Platform providers report strong quarterly bookings.", direction: "positive", strength: "medium" },
    { headline: "Tech Supply Chain Disruption", body: "Component shortages are affecting production schedules across the technology sector. Lead times have extended for several key parts.", direction: "negative", strength: "medium" },
    { headline: "AI Investment Surge", body: "Venture capital flowing into artificial intelligence startups reached new highs. Established tech firms are ramping up their own AI initiatives.", direction: "positive", strength: "large" },
  ],
  Finance: [
    { headline: "Banking Lending Activity Up", body: "Financial institutions report increased loan origination volumes. Both consumer and commercial lending categories showed growth.", direction: "positive", strength: "medium" },
    { headline: "Interest Rates Benefit Financials", body: "Rising rates have improved net interest margins for traditional banks. Analysts expect continued earnings strength in the sector.", direction: "positive", strength: "medium" },
    { headline: "Payment Processor Scrutiny", body: "Regulators announced expanded oversight of digital payment systems. Compliance costs are expected to increase for affected companies.", direction: "negative", strength: "medium" },
  ],
  Healthcare: [
    { headline: "Medical Device Approvals Accelerate", body: "The regulatory agency cleared a backlog of device applications. Several companies received faster-than-expected product authorizations.", direction: "positive", strength: "medium" },
    { headline: "Healthcare Spending to Rise", body: "Government projections show increased healthcare expenditures next quarter. Providers and device manufacturers may benefit.", direction: "positive", strength: "medium" },
    { headline: "Drug Pricing Under Review", body: "Lawmakers are examining pharmaceutical pricing practices. Industry observers see potential margin pressure ahead.", direction: "negative", strength: "medium" },
  ],
  Transportation: [
    { headline: "Shipping Rates Stabilize", body: "After months of volatility, container rates have found equilibrium. Logistics companies report improved planning visibility.", direction: "positive", strength: "small" },
    { headline: "Fuel Costs Pressure Margins", body: "Rising energy prices are squeezing transportation companies. Carriers are evaluating surcharge adjustments.", direction: "negative", strength: "medium" },
    { headline: "Urban Mobility Gets Municipal Support", body: "Several cities announced partnerships with mobility providers. Infrastructure investments are planned for next fiscal year.", direction: "positive", strength: "medium" },
  ],
  Utilities: [
    { headline: "Grid Infrastructure Investment", body: "Government backing for power grid modernization was announced. Utility companies stand to benefit from increased spending.", direction: "positive", strength: "medium" },
    { headline: "Renewable Energy Transition Continues", body: "Solar and wind capacity additions outpaced conventional sources. Clean energy providers see expanding opportunities.", direction: "positive", strength: "medium" },
  ],
  Materials: [
    { headline: "Battery Material Demand Surges", body: "Electric vehicle growth is driving increased demand for specialized materials. Mining and processing companies report strong order books.", direction: "positive", strength: "large" },
    { headline: "Raw Material Costs Rise", body: "Commodity prices have increased across multiple categories. Manufacturers face margin pressure from input costs.", direction: "negative", strength: "medium" },
  ],
  Consumer: [
    { headline: "Consumer Spending Resilient", body: "Retail sales data showed continued strength in discretionary categories. Consumer confidence remains elevated.", direction: "positive", strength: "small" },
    { headline: "Food Commodity Prices Stable", body: "Agricultural markets have found stability after recent volatility. Food producers benefit from predictable input costs.", direction: "positive", strength: "small" },
  ],
  Industrial: [
    { headline: "Factory Automation Investment Grows", body: "Manufacturers are accelerating robotics adoption to address labor constraints. Automation equipment demand remains strong.", direction: "positive", strength: "medium" },
    { headline: "Industrial Output Mixed", body: "Manufacturing activity shows uneven performance across subsectors. Some categories face inventory destocking.", direction: "negative", strength: "small" },
  ],
  Telecom: [
    { headline: "Telecom Infrastructure Steady", body: "Network equipment spending remains on track for the year. Carriers continue planned capital expenditure programs.", direction: "positive", strength: "small" },
    { headline: "5G Rollout Drives Subscriber Growth", body: "Next-generation wireless adoption is accelerating in urban markets. Average revenue per user metrics are improving.", direction: "positive", strength: "medium" },
  ],
};

const COMPANY_NEWS: Record<string, NewsTemplate[]> = {
  NLSY: [
    { headline: "Nordlite Systems Wins Major Contract", body: "Nordlite Systems (NLSY) secured a significant multi-year logistics technology deal. The contract includes platform deployment across regional distribution centers.", direction: "positive", strength: "large" },
    { headline: "Nordlite Faces Integration Delays", body: "Nordlite Systems (NLSY) reported challenges integrating its new platform at customer sites. Project timelines have been extended for several implementations.", direction: "negative", strength: "medium" },
  ],
  VCLD: [
    { headline: "Vanta Cloudworks Sets Signup Record", body: "Vanta Cloudworks (VCLD) announced record enterprise customer additions. The company's cloud platform saw accelerated adoption in the healthcare vertical.", direction: "positive", strength: "large" },
    { headline: "Vanta Cloud Outage Reported", body: "Vanta Cloudworks (VCLD) experienced a service disruption affecting customer operations. Engineering teams worked to restore full functionality within hours.", direction: "negative", strength: "medium" },
  ],
  KFRG: [
    { headline: "Kernel Forge Lands Government Deal", body: "Kernel Forge (KFRG) was selected for a federal cybersecurity initiative. The multi-phase contract spans critical infrastructure protection.", direction: "positive", strength: "large" },
    { headline: "Kernel Forge Faces New Competition", body: "Kernel Forge (KFRG) is responding to increased competitive pressure in its core market. Several new entrants have emerged with alternative solutions.", direction: "negative", strength: "medium" },
  ],
  HLBG: [
    { headline: "Halberg Industries Expands Capacity", body: "Halberg Industries (HLBG) announced plans to increase manufacturing output. New production lines will come online by next quarter.", direction: "positive", strength: "medium" },
    { headline: "Halberg Equipment Order Delayed", body: "Halberg Industries (HLBG) reported that a key equipment order has been pushed back. The delay stems from vendor supply constraints.", direction: "negative", strength: "small" },
  ],
  AGCO: [
    { headline: "Aurora Grid Wins Utility Contract", body: "Aurora Grid Co (AGCO) secured a regional power infrastructure agreement. The project includes grid modernization across three service territories.", direction: "positive", strength: "medium" },
    { headline: "Aurora Grid Permit Under Review", body: "Aurora Grid Co (AGCO) faces extended review of a major project permit. Regulatory timelines have shifted for the planned installation.", direction: "negative", strength: "small" },
  ],
  SLVX: [
    { headline: "Solvex Announces Tech Breakthrough", body: "Solvex Materials (SLVX) revealed a significant advancement in battery technology. The development could improve energy density in next-generation cells.", direction: "positive", strength: "large" },
    { headline: "Solvex Supply Chain Disrupted", body: "Solvex Materials (SLVX) reported disruptions in its raw material supply network. Production schedules may be affected in the near term.", direction: "negative", strength: "medium" },
  ],
  BHFN: [
    { headline: "Bronze Harbor Expands Lending", body: "Bronze Harbor Finance (BHFN) reported growth in its commercial lending portfolio. New originations exceeded quarterly targets.", direction: "positive", strength: "medium" },
    { headline: "Bronze Harbor Loan Quality Reviewed", body: "Bronze Harbor Finance (BHFN) disclosed increased provisions for potential loan losses. The company cited evolving economic conditions.", direction: "negative", strength: "medium" },
  ],
  MBPY: [
    { headline: "Mintbridge Payments Volume Grows", body: "Mintbridge Payments (MBPY) processed record transaction volumes last month. The platform continues to gain merchant adoption.", direction: "positive", strength: "medium" },
    { headline: "Mintbridge Under Regulatory Review", body: "Mintbridge Payments (MBPY) received notice of a regulatory examination. The company expects to cooperate fully with the review.", direction: "negative", strength: "medium" },
  ],
  OIGR: [
    { headline: "Orchard Insure Expands Coverage", body: "Orchard Insure Group (OIGR) launched new insurance products in three additional states. The expansion builds on strong regional performance.", direction: "positive", strength: "medium" },
    { headline: "Orchard Insure Claims Rise", body: "Orchard Insure Group (OIGR) reported higher-than-expected claims in a recent period. Weather-related events contributed to the increase.", direction: "negative", strength: "small" },
  ],
  CRMD: [
    { headline: "Cirrus Medical Receives Clearance", body: "Cirrus Medical (CRMD) obtained regulatory approval for its latest diagnostic device. Commercial launch is planned for next month.", direction: "positive", strength: "large" },
    { headline: "Cirrus Medical Recall Concerns", body: "Cirrus Medical (CRMD) is evaluating a voluntary recall of certain device components. The company emphasized patient safety protocols.", direction: "negative", strength: "large" },
  ],
  FJFF: [
    { headline: "Fjord Fresh Expands Distribution", body: "Fjord Fresh Foods (FJFF) announced new retail partnerships expanding product availability. The deals cover major grocery chains in new regions.", direction: "positive", strength: "medium" },
    { headline: "Fjord Fresh Faces Cost Pressure", body: "Fjord Fresh Foods (FJFF) reported margin pressure from ingredient cost increases. Pricing adjustments are being evaluated.", direction: "negative", strength: "small" },
  ],
  LRLB: [
    { headline: "Lumina Retail Labs Launches Platform", body: "Lumina Retail Labs (LRLB) debuted its next-generation retail analytics solution. Early adopters report improved conversion metrics.", direction: "positive", strength: "medium" },
    { headline: "Lumina Labs Customer Loss", body: "Lumina Retail Labs (LRLB) disclosed the departure of a significant customer. The company is pursuing new enterprise opportunities.", direction: "negative", strength: "medium" },
  ],
  SHMB: [
    { headline: "Skyharbor Expands to New Cities", body: "Skyharbor Mobility (SHMB) launched operations in four additional metropolitan areas. The expansion follows successful pilot programs.", direction: "positive", strength: "medium" },
    { headline: "Skyharbor Faces Regulatory Challenge", body: "Skyharbor Mobility (SHMB) encountered new municipal operating requirements. Compliance costs may increase in affected markets.", direction: "negative", strength: "small" },
  ],
  TWSH: [
    { headline: "Tideway Shipping Volume Increases", body: "Tideway Shipping (TWSH) reported strong cargo throughput gains. Port efficiency improvements contributed to higher utilization.", direction: "positive", strength: "medium" },
    { headline: "Tideway Vessel Maintenance Extended", body: "Tideway Shipping (TWSH) announced extended maintenance for several vessels. Fleet availability will be reduced temporarily.", direction: "negative", strength: "small" },
  ],
  PNTL: [
    { headline: "Pinnacle Telecom Network Upgrade", body: "Pinnacle Telecom (PNTL) completed a major infrastructure modernization milestone. Network capacity has been significantly expanded.", direction: "positive", strength: "medium" },
    { headline: "Pinnacle Telecom Subscriber Churn", body: "Pinnacle Telecom (PNTL) reported higher customer turnover in a competitive market. Retention programs are being enhanced.", direction: "negative", strength: "small" },
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

function getStrengthModifier(strength: "small" | "medium" | "large", direction: "positive" | "negative"): number {
  const sign = direction === "positive" ? 1 : -1;
  switch (strength) {
    case "small": return sign * (0.01 + Math.random() * 0.015);
    case "medium": return sign * (0.02 + Math.random() * 0.025);
    case "large": return sign * (0.04 + Math.random() * 0.06);
  }
}

function determineNewsCount(): number {
  const roll = Math.random();
  if (roll < 0.35) return 0;
  if (roll < 0.75) return 1;
  if (roll < 0.95) return 2;
  return 3;
}

function selectNewsType(): "company" | "sector" | "macro" {
  const roll = Math.random();
  if (roll < 0.60) return "company";
  if (roll < 0.90) return "sector";
  return "macro";
}

function generateDailyNews(stocks: Stock[]): { news: NewsItem[], effects: NewsEffect[] } {
  const newsCount = determineNewsCount();
  const news: NewsItem[] = [];
  const effects: NewsEffect[] = [];
  
  if (newsCount === 0) {
    return { news: [], effects: [] };
  }
  
  const usedCompanyTickers = new Set<string>();
  const usedSectors = new Set<string>();
  const sectors = Array.from(new Set(stocks.map(s => s.sector)));
  
  for (let i = 0; i < newsCount; i++) {
    const newsType = selectNewsType();
    
    if (newsType === "company") {
      const availableTickers = Object.keys(COMPANY_NEWS).filter(t => !usedCompanyTickers.has(t));
      if (availableTickers.length === 0) continue;
      
      const ticker = availableTickers[Math.floor(Math.random() * availableTickers.length)];
      usedCompanyTickers.add(ticker);
      
      const templates = COMPANY_NEWS[ticker];
      if (!templates || templates.length === 0) continue;
      
      const template = templates[Math.floor(Math.random() * templates.length)];
      const stock = stocks.find(s => s.ticker === ticker);
      
      news.push({
        id: `company-${ticker}-${Date.now()}-${i}`,
        headline: template.headline,
        body: template.body,
        type: "company",
        category: stock?.sector || "Company",
        affectedTickers: [ticker],
      });
      
      effects.push({
        id: `effect-company-${ticker}-${Date.now()}-${i}`,
        type: "company",
        target: ticker,
        direction: template.direction,
        strength: template.strength,
        daysRemaining: 1 + Math.floor(Math.random() * 2),
      });
      
    } else if (newsType === "sector") {
      const availableSectors = sectors.filter(s => !usedSectors.has(s) && SECTOR_NEWS[s]);
      if (availableSectors.length === 0) continue;
      
      const sector = availableSectors[Math.floor(Math.random() * availableSectors.length)];
      usedSectors.add(sector);
      
      const templates = SECTOR_NEWS[sector];
      if (!templates || templates.length === 0) continue;
      
      const template = templates[Math.floor(Math.random() * templates.length)];
      const affectedTickers = stocks.filter(s => s.sector === sector).map(s => s.ticker);
      
      news.push({
        id: `sector-${sector}-${Date.now()}-${i}`,
        headline: template.headline,
        body: template.body,
        type: "sector",
        category: sector,
        affectedTickers,
        affectedSector: sector,
      });
      
      effects.push({
        id: `effect-sector-${sector}-${Date.now()}-${i}`,
        type: "sector",
        target: sector,
        direction: template.direction,
        strength: template.strength,
        daysRemaining: 1 + Math.floor(Math.random() * 2),
      });
      
    } else {
      const template = MACRO_NEWS[Math.floor(Math.random() * MACRO_NEWS.length)];
      
      news.push({
        id: `macro-${Date.now()}-${i}`,
        headline: template.headline,
        body: template.body,
        type: "macro",
        category: "Economy",
      });
      
      effects.push({
        id: `effect-macro-${Date.now()}-${i}`,
        type: "macro",
        target: "market",
        direction: template.direction,
        strength: template.strength,
        daysRemaining: 1,
      });
    }
  }
  
  return { news, effects };
}

function applyNewsEffects(stocks: Stock[], effects: NewsEffect[]): Map<string, number> {
  const modifiers = new Map<string, number>();
  
  for (const effect of effects) {
    const modifier = getStrengthModifier(effect.strength, effect.direction);
    
    if (effect.type === "company") {
      const currentMod = modifiers.get(effect.target) || 0;
      modifiers.set(effect.target, currentMod + modifier);
    } else if (effect.type === "sector") {
      const sectorStocks = stocks.filter(s => s.sector === effect.target);
      for (const stock of sectorStocks) {
        const currentMod = modifiers.get(stock.ticker) || 0;
        modifiers.set(stock.ticker, currentMod + modifier * 0.6);
      }
    } else if (effect.type === "macro") {
      for (const stock of stocks) {
        const currentMod = modifiers.get(stock.ticker) || 0;
        modifiers.set(stock.ticker, currentMod + modifier * 0.3);
      }
    }
  }
  
  return modifiers;
}

function decayEffects(effects: NewsEffect[]): NewsEffect[] {
  return effects
    .map(e => ({ ...e, daysRemaining: e.daysRemaining - 1 }))
    .filter(e => e.daysRemaining > 0);
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
      activeNewsEffects: [],
      hadNewsToday: false,
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
      
      spendCash: (amount, reason) => {
        const { cash } = get();
        if (amount <= 0 || amount > cash) return false;
        
        const messages = [...get().feedMessages];
        if (reason) {
          messages.push(reason);
        }
        
        set({ 
          cash: Math.round((cash - amount) * 100) / 100,
          feedMessages: messages
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
        const { stocks, positions, cash, tutorialMode, tutorialTicker, activeNewsEffects } = get();
        
        const previousValue = positions.reduce((total, pos) => {
          const stock = stocks.find(s => s.ticker === pos.ticker);
          return total + (stock ? pos.shares * stock.previousPrice : 0);
        }, 0) + cash;
        
        const { news, effects: newEffects } = generateDailyNews(stocks);
        
        const allEffects = [...activeNewsEffects, ...newEffects];
        const modifiers = applyNewsEffects(stocks, allEffects);
        
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
        const decayedEffects = decayEffects(allEffects);
        
        set({
          stocks: updatedStocks,
          dailyPnL: Math.round(dailyPnL * 100) / 100,
          reputation: newRep,
          showEndOfDayModal: true,
          dailyNews: news,
          activeNewsEffects: decayedEffects,
          hadNewsToday: news.length > 0,
        });
        if (!tutorialMode) {
          saveState(get());
        }
      },
      
      startNewDay: () => {
        const { dailyNews } = get();
        const newsHeadlines = dailyNews.length > 0 
          ? dailyNews.map(n => `• ${n.headline}`)
          : [];
        
        set({
          day: get().day + 1,
          showEndOfDayModal: false,
          newClientUsedToday: false,
          dailyNews: [],
          hadNewsToday: false,
          feedMessages: newsHeadlines.length > 0 
            ? ["--- New Trading Day ---", ...newsHeadlines]
            : ["--- New Trading Day ---", "Quiet day. No major headlines."],
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
          activeNewsEffects: [],
          hadNewsToday: false,
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
          activeNewsEffects: [],
          hadNewsToday: false,
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
