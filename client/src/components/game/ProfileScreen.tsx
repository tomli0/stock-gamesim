import { useState } from "react";
import { useStockGame } from "@/lib/stores/useStockGame";
import { usePlayerProfile } from "@/lib/stores/usePlayerProfile";
import { useIdleIncome } from "@/lib/stores/useIdleIncome";
import { 
  ItemCategory, 
  RARITY_COLORS, 
  RARITY_BG_COLORS,
  getItemsByCategory,
  ShopItem 
} from "@/lib/shop/catalog";

interface ProfileScreenProps {
  onClose: () => void;
}

const CAREER_TITLES: Record<string, string> = {
  Junior: "Junior Trader",
  Associate: "Associate Broker",
  Senior: "Senior Portfolio Manager",
  Partner: "Fund Partner",
};

const SLOT_ICONS: Record<ItemCategory, string> = {
  watch: "⌚",
  car: "🚗",
  art: "🖼️",
  office: "🏢",
};

const SLOT_LABELS: Record<ItemCategory, string> = {
  watch: "Watch",
  car: "Car",
  art: "Art",
  office: "Office",
};

export default function ProfileScreen({ onClose }: ProfileScreenProps) {
  const [editingName, setEditingName] = useState(false);
  const [editingTagline, setEditingTagline] = useState(false);
  const [showInventory, setShowInventory] = useState<ItemCategory | null>(null);
  
  const { cash, getCareerLevel, getPortfolioValue, getTotalValue, reputation } = useStockGame();
  const { name, tagline, setName, setTagline, equipped, getEquippedItem, equipItem, unequipItem, ownedItemIds } = usePlayerProfile();
  const { fundSize } = useIdleIncome();
  
  const careerLevel = getCareerLevel();
  const title = CAREER_TITLES[careerLevel] || careerLevel;
  const totalValue = getTotalValue();
  const portfolioValue = getPortfolioValue();
  
  const [tempName, setTempName] = useState(name);
  const [tempTagline, setTempTagline] = useState(tagline);
  
  const handleSaveName = () => {
    if (tempName.trim()) {
      setName(tempName.trim());
    }
    setEditingName(false);
  };
  
  const handleSaveTagline = () => {
    setTagline(tempTagline.trim());
    setEditingTagline(false);
  };
  
  const getOwnedItemsForCategory = (category: ItemCategory): ShopItem[] => {
    return getItemsByCategory(category).filter(item => ownedItemIds.includes(item.id));
  };
  
  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Trader Profile</h1>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-2xl mx-auto w-full">
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 space-y-2">
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-slate-800 text-white px-3 py-1 rounded border border-slate-600 flex-1"
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-white text-xl font-bold">{name}</h2>
                  <button
                    onClick={() => { setTempName(name); setEditingName(true); }}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="text-blue-400 font-medium">{title}</div>
              
              {editingTagline ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempTagline}
                    onChange={(e) => setTempTagline(e.target.value)}
                    className="bg-slate-800 text-slate-300 px-3 py-1 rounded border border-slate-600 flex-1 text-sm"
                    maxLength={50}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTagline}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-slate-400 text-sm italic">"{tagline}"</p>
                  <button
                    onClick={() => { setTempTagline(tagline); setEditingTagline(true); }}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
          <h3 className="text-white font-bold mb-4">Career & Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Reputation</div>
              <div className="text-white font-bold text-lg">{reputation}/100</div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${reputation}%` }}
                />
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Fund Size (AUM)</div>
              <div className="text-purple-400 font-bold text-lg">${fundSize.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Cash</div>
              <div className="text-green-400 font-bold text-lg">${cash.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-slate-400 text-xs mb-1">Net Worth</div>
              <div className="text-white font-bold text-lg">${totalValue.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4">
          <h3 className="text-white font-bold mb-4">Equipped Lifestyle</h3>
          <div className="grid grid-cols-2 gap-3">
            {(["watch", "car", "art", "office"] as ItemCategory[]).map((category) => {
              const equippedItem = getEquippedItem(category);
              const ownedCount = getOwnedItemsForCategory(category).length;
              
              return (
                <div
                  key={category}
                  className={`${equippedItem ? RARITY_BG_COLORS[equippedItem.rarity] : "bg-slate-800/50"} border ${equippedItem ? RARITY_COLORS[equippedItem.rarity].split(" ")[1] : "border-slate-700"} rounded-lg p-3`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{SLOT_ICONS[category]}</span>
                    <span className="text-slate-400 text-sm">{SLOT_LABELS[category]}</span>
                  </div>
                  
                  {equippedItem ? (
                    <div>
                      <div className="text-white font-medium text-sm">{equippedItem.name}</div>
                      <div className={`text-xs ${RARITY_COLORS[equippedItem.rarity].split(" ")[0]}`}>
                        {equippedItem.rarity}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">Empty</div>
                  )}
                  
                  {ownedCount > 0 && (
                    <button
                      onClick={() => setShowInventory(category)}
                      className="mt-2 text-blue-400 hover:text-blue-300 text-xs underline"
                    >
                      Change ({ownedCount} owned)
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {showInventory && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-white font-bold">
                {SLOT_ICONS[showInventory]} {SLOT_LABELS[showInventory]} Collection
              </h3>
              <button
                onClick={() => setShowInventory(null)}
                className="text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
              <button
                onClick={() => { unequipItem(showInventory); setShowInventory(null); }}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-3 text-left"
              >
                <div className="text-slate-400">None (Unequip)</div>
              </button>
              
              {getOwnedItemsForCategory(showInventory).map((item) => {
                const isEquipped = equipped[showInventory] === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => { equipItem(item.id); setShowInventory(null); }}
                    className={`w-full ${RARITY_BG_COLORS[item.rarity]} border ${RARITY_COLORS[item.rarity].split(" ")[1]} rounded-lg p-3 text-left ${isEquipped ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className={`text-xs ${RARITY_COLORS[item.rarity].split(" ")[0]}`}>
                          {item.rarity}
                        </div>
                      </div>
                      {isEquipped && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Equipped
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
