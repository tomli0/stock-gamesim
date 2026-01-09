import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";
import type { CareerLevel } from "./useStockGame";

export interface RewardedBoost {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  durationMs: number;
  cooldownMs: number;
  activatedAt: number | null;
  lastUsedAt: number | null;
}

export interface IdleState {
  tapBoostPercent: number;
  tapBoostMaxPercent: number;
  tapBoostDecayPerSecond: number;
  lastActiveTimestamp: number;
  totalEarnedFromIdle: number;
  pendingOfflineEarnings: number;
  showWelcomeBackModal: boolean;
  
  rewardedBoosts: RewardedBoost[];
  
  getIncomePerSecond: (careerLevel: CareerLevel) => number;
  getActiveMultiplier: () => number;
  getTapBoostMultiplier: () => number;
  
  tap: () => void;
  tickIdle: (careerLevel: CareerLevel) => number;
  decayTapBoost: (deltaSeconds: number) => void;
  calculateOfflineEarnings: (careerLevel: CareerLevel) => void;
  collectOfflineEarnings: () => number;
  dismissWelcomeBack: () => void;
  
  activateRewardedBoost: (boostId: string) => boolean;
  getBoostTimeRemaining: (boostId: string) => number;
  getBoostCooldownRemaining: (boostId: string) => number;
  isBoostActive: (boostId: string) => boolean;
  isBoostOnCooldown: (boostId: string) => boolean;
  
  saveIdleState: () => void;
  updateLastActive: () => void;
  resetIdleState: () => void;
}

const IDLE_STORAGE_KEY = "stock-broker-idle-save";
const MAX_OFFLINE_HOURS = 8;
const MAX_OFFLINE_SECONDS = MAX_OFFLINE_HOURS * 60 * 60;

const BASE_INCOME_BY_CAREER: Record<CareerLevel, { min: number; max: number }> = {
  Junior: { min: 1, max: 5 },
  Associate: { min: 5, max: 15 },
  Senior: { min: 20, max: 60 },
  Partner: { min: 100, max: 300 },
};

const INITIAL_BOOSTS: RewardedBoost[] = [
  {
    id: "double-income",
    name: "Double Income",
    description: "2x income for 30 minutes",
    multiplier: 2,
    durationMs: 30 * 60 * 1000,
    cooldownMs: 60 * 60 * 1000,
    activatedAt: null,
    lastUsedAt: null,
  },
  {
    id: "instant-collect",
    name: "Instant Offline Collect",
    description: "Collect max offline earnings instantly",
    multiplier: 1,
    durationMs: 0,
    cooldownMs: 24 * 60 * 60 * 1000,
    activatedAt: null,
    lastUsedAt: null,
  },
];

function loadIdleState(): Partial<IdleState> | null {
  const saved = getLocalStorage(IDLE_STORAGE_KEY);
  if (saved) {
    return saved;
  }
  return null;
}

function getBaseIncomeForCareer(careerLevel: CareerLevel): number {
  const range = BASE_INCOME_BY_CAREER[careerLevel];
  return range.min;
}

export const useIdleIncome = create<IdleState>()(
  subscribeWithSelector((set, get) => {
    const savedState = loadIdleState();
    
    return {
      tapBoostPercent: 0,
      tapBoostMaxPercent: 100,
      tapBoostDecayPerSecond: 0.2,
      lastActiveTimestamp: savedState?.lastActiveTimestamp || Date.now(),
      totalEarnedFromIdle: savedState?.totalEarnedFromIdle || 0,
      pendingOfflineEarnings: 0,
      showWelcomeBackModal: false,
      
      rewardedBoosts: savedState?.rewardedBoosts || INITIAL_BOOSTS,
      
      getIncomePerSecond: (careerLevel: CareerLevel) => {
        const { tapBoostPercent } = get();
        const base = getBaseIncomeForCareer(careerLevel);
        const tapMultiplier = 1 + tapBoostPercent / 100;
        const activeMultiplier = get().getActiveMultiplier();
        return Math.round(base * tapMultiplier * activeMultiplier * 100) / 100;
      },
      
      getActiveMultiplier: () => {
        const { rewardedBoosts } = get();
        const now = Date.now();
        let multiplier = 1;
        
        for (const boost of rewardedBoosts) {
          if (boost.activatedAt && boost.durationMs > 0) {
            const elapsed = now - boost.activatedAt;
            if (elapsed < boost.durationMs) {
              multiplier *= boost.multiplier;
            }
          }
        }
        
        return multiplier;
      },
      
      getTapBoostMultiplier: () => {
        return 1 + get().tapBoostPercent / 100;
      },
      
      tap: () => {
        const { tapBoostPercent, tapBoostMaxPercent } = get();
        const newBoost = Math.min(tapBoostPercent + 2, tapBoostMaxPercent);
        set({ tapBoostPercent: newBoost });
      },
      
      tickIdle: (careerLevel: CareerLevel) => {
        const income = get().getIncomePerSecond(careerLevel);
        set(state => ({
          totalEarnedFromIdle: Math.round((state.totalEarnedFromIdle + income) * 100) / 100,
        }));
        get().updateLastActive();
        return income;
      },
      
      decayTapBoost: (deltaSeconds: number) => {
        const { tapBoostPercent, tapBoostDecayPerSecond } = get();
        const decay = tapBoostDecayPerSecond * deltaSeconds;
        const newBoost = Math.max(0, tapBoostPercent - decay);
        set({ tapBoostPercent: newBoost });
      },
      
      calculateOfflineEarnings: (careerLevel: CareerLevel) => {
        const { lastActiveTimestamp, rewardedBoosts } = get();
        const now = Date.now();
        const offlineSeconds = Math.min((now - lastActiveTimestamp) / 1000, MAX_OFFLINE_SECONDS);
        
        if (offlineSeconds < 60) {
          set({ pendingOfflineEarnings: 0, showWelcomeBackModal: false });
          return;
        }
        
        const baseIncome = getBaseIncomeForCareer(careerLevel);
        
        let multiplierAtExit = 1;
        for (const boost of rewardedBoosts) {
          if (boost.activatedAt && boost.durationMs > 0) {
            const boostEndTime = boost.activatedAt + boost.durationMs;
            if (boostEndTime > lastActiveTimestamp) {
              multiplierAtExit *= boost.multiplier;
            }
          }
        }
        
        const earnings = Math.round(baseIncome * offlineSeconds * multiplierAtExit * 100) / 100;
        
        if (earnings > 0) {
          set({ 
            pendingOfflineEarnings: earnings,
            showWelcomeBackModal: true,
          });
        }
      },
      
      collectOfflineEarnings: () => {
        const { pendingOfflineEarnings } = get();
        set({ 
          pendingOfflineEarnings: 0, 
          showWelcomeBackModal: false,
          totalEarnedFromIdle: get().totalEarnedFromIdle + pendingOfflineEarnings,
        });
        get().updateLastActive();
        get().saveIdleState();
        return pendingOfflineEarnings;
      },
      
      dismissWelcomeBack: () => {
        set({ showWelcomeBackModal: false });
        get().collectOfflineEarnings();
      },
      
      activateRewardedBoost: (boostId: string) => {
        const { rewardedBoosts } = get();
        const boostIndex = rewardedBoosts.findIndex(b => b.id === boostId);
        if (boostIndex === -1) return false;
        
        const boost = rewardedBoosts[boostIndex];
        const now = Date.now();
        
        if (boost.lastUsedAt) {
          const cooldownEnd = boost.lastUsedAt + boost.cooldownMs;
          if (now < cooldownEnd) return false;
        }
        
        const updatedBoosts = [...rewardedBoosts];
        updatedBoosts[boostIndex] = {
          ...boost,
          activatedAt: now,
          lastUsedAt: now,
        };
        
        set({ rewardedBoosts: updatedBoosts });
        get().saveIdleState();
        return true;
      },
      
      getBoostTimeRemaining: (boostId: string) => {
        const boost = get().rewardedBoosts.find(b => b.id === boostId);
        if (!boost || !boost.activatedAt || boost.durationMs === 0) return 0;
        
        const elapsed = Date.now() - boost.activatedAt;
        return Math.max(0, boost.durationMs - elapsed);
      },
      
      getBoostCooldownRemaining: (boostId: string) => {
        const boost = get().rewardedBoosts.find(b => b.id === boostId);
        if (!boost || !boost.lastUsedAt) return 0;
        
        const elapsed = Date.now() - boost.lastUsedAt;
        return Math.max(0, boost.cooldownMs - elapsed);
      },
      
      isBoostActive: (boostId: string) => {
        return get().getBoostTimeRemaining(boostId) > 0;
      },
      
      isBoostOnCooldown: (boostId: string) => {
        return get().getBoostCooldownRemaining(boostId) > 0;
      },
      
      saveIdleState: () => {
        const state = get();
        setLocalStorage(IDLE_STORAGE_KEY, {
          lastActiveTimestamp: state.lastActiveTimestamp,
          totalEarnedFromIdle: state.totalEarnedFromIdle,
          rewardedBoosts: state.rewardedBoosts,
        });
      },
      
      updateLastActive: () => {
        set({ lastActiveTimestamp: Date.now() });
      },
      
      resetIdleState: () => {
        localStorage.removeItem(IDLE_STORAGE_KEY);
        set({
          tapBoostPercent: 0,
          lastActiveTimestamp: Date.now(),
          totalEarnedFromIdle: 0,
          pendingOfflineEarnings: 0,
          showWelcomeBackModal: false,
          rewardedBoosts: INITIAL_BOOSTS,
        });
      },
    };
  })
);
