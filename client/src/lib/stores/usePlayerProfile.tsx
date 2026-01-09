import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";
import { ItemCategory, ShopItem, getItemById, meetsCareerRequirement } from "../shop/catalog";
import type { CareerLevel } from "../shop/catalog";

export interface EquippedItems {
  watch: string | null;
  car: string | null;
  art: string | null;
  office: string | null;
}

export interface PlayerProfileState {
  name: string;
  tagline: string;
  ownedItemIds: string[];
  equipped: EquippedItems;
  
  setName: (name: string) => void;
  setTagline: (tagline: string) => void;
  
  ownsItem: (itemId: string) => boolean;
  purchaseItem: (item: ShopItem, cash: number, careerLevel: CareerLevel) => { success: boolean; error?: string };
  equipItem: (itemId: string) => boolean;
  unequipItem: (category: ItemCategory) => void;
  getEquippedItem: (category: ItemCategory) => ShopItem | null;
  
  saveProfile: () => void;
  resetCosmetics: () => void;
}

const PROFILE_STORAGE_KEY = "stock-broker-profile";

interface SavedProfile {
  name: string;
  tagline: string;
  ownedItemIds: string[];
  equipped: EquippedItems;
}

function loadProfile(): SavedProfile | null {
  const saved = getLocalStorage(PROFILE_STORAGE_KEY);
  return saved || null;
}

export const usePlayerProfile = create<PlayerProfileState>()(
  subscribeWithSelector((set, get) => {
    const savedProfile = loadProfile();
    
    return {
      name: savedProfile?.name || "Trader",
      tagline: savedProfile?.tagline || "Making moves in the market",
      ownedItemIds: savedProfile?.ownedItemIds || [],
      equipped: savedProfile?.equipped || {
        watch: null,
        car: null,
        art: null,
        office: null,
      },
      
      setName: (name: string) => {
        set({ name });
        get().saveProfile();
      },
      
      setTagline: (tagline: string) => {
        set({ tagline });
        get().saveProfile();
      },
      
      ownsItem: (itemId: string) => {
        return get().ownedItemIds.includes(itemId);
      },
      
      purchaseItem: (item: ShopItem, cash: number, careerLevel: CareerLevel) => {
        const { ownedItemIds, ownsItem } = get();
        
        if (ownsItem(item.id)) {
          return { success: false, error: "Already owned" };
        }
        
        if (!meetsCareerRequirement(careerLevel, item.requiredCareerLevel)) {
          return { success: false, error: `Requires ${item.requiredCareerLevel} level` };
        }
        
        if (cash < item.price) {
          return { success: false, error: "Insufficient cash" };
        }
        
        set({ ownedItemIds: [...ownedItemIds, item.id] });
        get().saveProfile();
        
        return { success: true };
      },
      
      equipItem: (itemId: string) => {
        const { ownedItemIds, equipped } = get();
        
        if (!ownedItemIds.includes(itemId)) {
          return false;
        }
        
        const item = getItemById(itemId);
        if (!item) return false;
        
        set({
          equipped: {
            ...equipped,
            [item.category]: itemId,
          },
        });
        get().saveProfile();
        
        return true;
      },
      
      unequipItem: (category: ItemCategory) => {
        const { equipped } = get();
        set({
          equipped: {
            ...equipped,
            [category]: null,
          },
        });
        get().saveProfile();
      },
      
      getEquippedItem: (category: ItemCategory) => {
        const { equipped } = get();
        const itemId = equipped[category];
        if (!itemId) return null;
        return getItemById(itemId) || null;
      },
      
      saveProfile: () => {
        const state = get();
        setLocalStorage(PROFILE_STORAGE_KEY, {
          name: state.name,
          tagline: state.tagline,
          ownedItemIds: state.ownedItemIds,
          equipped: state.equipped,
        });
      },
      
      resetCosmetics: () => {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
        set({
          ownedItemIds: [],
          equipped: {
            watch: null,
            car: null,
            art: null,
            office: null,
          },
        });
      },
    };
  })
);
