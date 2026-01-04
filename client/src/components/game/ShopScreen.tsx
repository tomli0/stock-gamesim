import { useState } from "react";
import { useStockGame } from "@/lib/stores/useStockGame";
import { usePlayerProfile } from "@/lib/stores/usePlayerProfile";
import { 
  SHOP_CATALOG, 
  ItemCategory, 
  ShopItem, 
  RARITY_COLORS, 
  RARITY_BG_COLORS,
  meetsCareerRequirement,
  getItemsByCategory 
} from "@/lib/shop/catalog";

interface ShopScreenProps {
  onClose: () => void;
}

type SortOption = "price-asc" | "price-desc" | "rarity" | "owned";

const CATEGORIES: { id: ItemCategory; label: string; icon: string }[] = [
  { id: "watch", label: "Watches", icon: "⌚" },
  { id: "car", label: "Cars", icon: "🚗" },
  { id: "art", label: "Art", icon: "🖼️" },
  { id: "office", label: "Office", icon: "🏢" },
];

const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3 };

export default function ShopScreen({ onClose }: ShopScreenProps) {
  const [activeCategory, setActiveCategory] = useState<ItemCategory>("watch");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const { cash, getCareerLevel } = useStockGame();
  const { ownsItem, purchaseItem, equipItem, equipped } = usePlayerProfile();
  const careerLevel = getCareerLevel();
  
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const handlePurchase = (item: ShopItem) => {
    const result = purchaseItem(item, cash, careerLevel);
    if (result.success) {
      useStockGame.setState({ cash: cash - item.price });
      showToast(`Purchased: ${item.name}`, "success");
    } else {
      showToast(result.error || "Purchase failed", "error");
    }
  };
  
  const handleEquip = (item: ShopItem) => {
    if (equipItem(item.id)) {
      showToast(`Equipped: ${item.name}`, "success");
    }
  };
  
  const items = getItemsByCategory(activeCategory);
  
  const sortedItems = [...items].sort((a, b) => {
    const aOwned = ownsItem(a.id);
    const bOwned = ownsItem(b.id);
    
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rarity":
        return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
      case "owned":
        if (aOwned && !bOwned) return -1;
        if (!aOwned && bOwned) return 1;
        return a.price - b.price;
      default:
        return 0;
    }
  });
  
  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Lifestyle Shop</h1>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="bg-slate-900/80 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="text-slate-300 text-sm">
          Cash: <span className="text-green-400 font-bold">${cash.toLocaleString()}</span>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-slate-800 text-white text-sm rounded px-2 py-1 border border-slate-600"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rarity">Rarity</option>
          <option value="owned">Owned First</option>
        </select>
      </div>
      
      <div className="flex border-b border-slate-700 bg-slate-900/50 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 min-w-[80px] px-4 py-3 text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "text-white border-b-2 border-blue-500 bg-slate-800/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {sortedItems.map((item) => {
            const owned = ownsItem(item.id);
            const isEquipped = equipped[item.category] === item.id;
            const canAfford = cash >= item.price;
            const meetsLevel = meetsCareerRequirement(careerLevel, item.requiredCareerLevel);
            
            return (
              <div
                key={item.id}
                className={`${RARITY_BG_COLORS[item.rarity]} border ${RARITY_COLORS[item.rarity].split(" ")[1]} rounded-lg p-4 flex flex-col`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-bold">{item.name}</h3>
                    <span className={`text-xs font-medium uppercase ${RARITY_COLORS[item.rarity].split(" ")[0]}`}>
                      {item.rarity}
                    </span>
                  </div>
                  {owned && (
                    <span className="bg-green-600/30 text-green-400 text-xs px-2 py-1 rounded">
                      Owned
                    </span>
                  )}
                </div>
                
                <p className="text-slate-400 text-sm mb-3 flex-1">{item.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Price:</span>
                    <span className={`font-bold ${canAfford || owned ? "text-green-400" : "text-red-400"}`}>
                      ${item.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {!meetsLevel && !owned && (
                    <div className="text-amber-400 text-xs flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Requires {item.requiredCareerLevel}
                    </div>
                  )}
                  
                  {owned ? (
                    <button
                      onClick={() => handleEquip(item)}
                      disabled={isEquipped}
                      className={`w-full py-2 rounded font-medium text-sm transition-colors ${
                        isEquipped
                          ? "bg-slate-700 text-slate-400 cursor-default"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {isEquipped ? "Equipped" : "Equip"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford || !meetsLevel}
                      className={`w-full py-2 rounded font-medium text-sm transition-colors ${
                        canAfford && meetsLevel
                          ? "bg-green-600 hover:bg-green-500 text-white"
                          : "bg-slate-700 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {!meetsLevel ? "Locked" : !canAfford ? "Can't Afford" : "Purchase"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-60 ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        } text-white font-medium`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
