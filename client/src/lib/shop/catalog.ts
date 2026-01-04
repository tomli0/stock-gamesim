export type ItemCategory = "watch" | "car" | "art" | "office";
export type ItemRarity = "common" | "rare" | "epic" | "legendary";
export type CareerLevel = "Junior" | "Associate" | "Senior" | "Partner";

export interface ShopItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  price: number;
  requiredCareerLevel: CareerLevel;
  description: string;
}

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: "text-slate-400 border-slate-500",
  rare: "text-blue-400 border-blue-500",
  epic: "text-purple-400 border-purple-500",
  legendary: "text-amber-400 border-amber-500",
};

export const RARITY_BG_COLORS: Record<ItemRarity, string> = {
  common: "bg-slate-800/50",
  rare: "bg-blue-900/30",
  epic: "bg-purple-900/30",
  legendary: "bg-amber-900/30",
};

export const CAREER_ORDER: CareerLevel[] = ["Junior", "Associate", "Senior", "Partner"];

export function meetsCareerRequirement(playerLevel: CareerLevel, requiredLevel: CareerLevel): boolean {
  return CAREER_ORDER.indexOf(playerLevel) >= CAREER_ORDER.indexOf(requiredLevel);
}

export const SHOP_CATALOG: ShopItem[] = [
  // WATCHES (6 items)
  {
    id: "watch-metro-quartz",
    name: "Metro Quartz",
    category: "watch",
    rarity: "common",
    price: 25000,
    requiredCareerLevel: "Junior",
    description: "A reliable everyday timepiece for the aspiring trader.",
  },
  {
    id: "watch-harbor-automatic",
    name: "Harbor Automatic",
    category: "watch",
    rarity: "common",
    price: 60000,
    requiredCareerLevel: "Junior",
    description: "Swiss movement, understated elegance.",
  },
  {
    id: "watch-chrono-steel",
    name: "Chrono Steel",
    category: "watch",
    rarity: "rare",
    price: 150000,
    requiredCareerLevel: "Associate",
    description: "Precision chronograph for timing your trades.",
  },
  {
    id: "watch-night-dial-gmt",
    name: "Night Dial GMT",
    category: "watch",
    rarity: "rare",
    price: 250000,
    requiredCareerLevel: "Associate",
    description: "Track multiple time zones. London, Tokyo, New York.",
  },
  {
    id: "watch-aurora-skeleton",
    name: "Aurora Skeleton",
    category: "watch",
    rarity: "epic",
    price: 800000,
    requiredCareerLevel: "Senior",
    description: "Transparent face reveals the intricate mechanics within.",
  },
  {
    id: "watch-platinum-legacy",
    name: "Platinum Legacy",
    category: "watch",
    rarity: "legendary",
    price: 2500000,
    requiredCareerLevel: "Partner",
    description: "The ultimate statement. Pure platinum, limitless prestige.",
  },

  // CARS (6 items)
  {
    id: "car-compact-street",
    name: "Compact Street",
    category: "car",
    rarity: "common",
    price: 120000,
    requiredCareerLevel: "Junior",
    description: "Gets you to the office. Reliably.",
  },
  {
    id: "car-sport-coupe",
    name: "Sport Coupe",
    category: "car",
    rarity: "common",
    price: 220000,
    requiredCareerLevel: "Junior",
    description: "A hint of speed for the ambitious trader.",
  },
  {
    id: "car-executive-sedan",
    name: "Executive Sedan",
    category: "car",
    rarity: "rare",
    price: 450000,
    requiredCareerLevel: "Associate",
    description: "Leather interior, V8 engine, corner office energy.",
  },
  {
    id: "car-luxury-suv",
    name: "Luxury SUV",
    category: "car",
    rarity: "rare",
    price: 650000,
    requiredCareerLevel: "Associate",
    description: "Command the road like you command the markets.",
  },
  {
    id: "car-grand-touring",
    name: "Grand Touring Coupe",
    category: "car",
    rarity: "epic",
    price: 1800000,
    requiredCareerLevel: "Senior",
    description: "Italian craftsmanship. 0-60 in 3.2 seconds.",
  },
  {
    id: "car-track-hyper",
    name: "Track Hyper",
    category: "car",
    rarity: "legendary",
    price: 7500000,
    requiredCareerLevel: "Partner",
    description: "One of twelve ever made. Carbon fiber everything.",
  },

  // ART (6 items)
  {
    id: "art-minimal-horizon",
    name: "Minimal Horizon Print",
    category: "art",
    rarity: "common",
    price: 30000,
    requiredCareerLevel: "Junior",
    description: "Clean lines. Clear thinking. Good vibes.",
  },
  {
    id: "art-city-lights",
    name: "City Lights Photography",
    category: "art",
    rarity: "common",
    price: 55000,
    requiredCareerLevel: "Junior",
    description: "Manhattan skyline at dusk. Your future view.",
  },
  {
    id: "art-abstract-market",
    name: "Abstract Market Lines",
    category: "art",
    rarity: "rare",
    price: 220000,
    requiredCareerLevel: "Associate",
    description: "Inspired by candlestick patterns. Surprisingly beautiful.",
  },
  {
    id: "art-bronze-bull",
    name: "Bronze Bull Sculpture",
    category: "art",
    rarity: "rare",
    price: 380000,
    requiredCareerLevel: "Associate",
    description: "A miniature tribute to Wall Street's famous icon.",
  },
  {
    id: "art-volatility-canvas",
    name: "Volatility Canvas Series",
    category: "art",
    rarity: "epic",
    price: 950000,
    requiredCareerLevel: "Senior",
    description: "Three panels capturing the chaos and beauty of markets.",
  },
  {
    id: "art-the-alpha",
    name: "The Alpha Original",
    category: "art",
    rarity: "legendary",
    price: 3800000,
    requiredCareerLevel: "Partner",
    description: "One of a kind. The artist's magnum opus.",
  },

  // OFFICE (6 items)
  {
    id: "office-walnut-desk",
    name: "Walnut Desk Set",
    category: "office",
    rarity: "common",
    price: 40000,
    requiredCareerLevel: "Junior",
    description: "Solid wood. Solid foundation for your career.",
  },
  {
    id: "office-leather-chair",
    name: "Premium Leather Chair",
    category: "office",
    rarity: "common",
    price: 75000,
    requiredCareerLevel: "Junior",
    description: "Ergonomic comfort for those long trading sessions.",
  },
  {
    id: "office-neon-ticker",
    name: "Neon Ticker Sign",
    category: "office",
    rarity: "rare",
    price: 180000,
    requiredCareerLevel: "Associate",
    description: "Custom LED display. Always know when markets are open.",
  },
  {
    id: "office-globe-bar",
    name: "Globe Bar Cart",
    category: "office",
    rarity: "rare",
    price: 320000,
    requiredCareerLevel: "Associate",
    description: "For celebrating big wins. Responsibly.",
  },
  {
    id: "office-marble-sculpture",
    name: "Marble Desk Sculpture",
    category: "office",
    rarity: "epic",
    price: 1200000,
    requiredCareerLevel: "Senior",
    description: "Hand-carved Italian marble. Pure sophistication.",
  },
  {
    id: "office-private-upgrade",
    name: "Private Office Upgrade",
    category: "office",
    rarity: "legendary",
    price: 5000000,
    requiredCareerLevel: "Partner",
    description: "Corner office with panoramic city views.",
  },
];

export function getItemsByCategory(category: ItemCategory): ShopItem[] {
  return SHOP_CATALOG.filter(item => item.category === category);
}

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_CATALOG.find(item => item.id === id);
}
