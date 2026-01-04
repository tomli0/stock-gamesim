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
  fundSize: number;
  baseIncomePerSecond: number;
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
  
  increaseFundSize: (amount: number) => void;
  applyTradingPerformance: (dailyReturn: number, portfolioValue: number) => void;
  updateCareerMultiplier: (careerLevel: CareerLevel) => void;
  
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
    name: "Double Fund Income",
    description: "2x fund income for 30 minutes",
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

function getBaseIncomeForCareer(careerLevel: CareerLevel, fundSize: number): number {
  const range = BASE_INCOME_BY_CAREER[careerLevel];
  const fundProgress = Math.min(fundSize / 10000000, 1);
  const baseIncome = range.min + (range.max - range.min) * fundProgress;
  return Math.min(baseIncome, range.max);
}

export const useIdleIncome = create<IdleState>()(
  subscribeWithSelector((set, get) => {
    const savedState = loadIdleState();
    
    return {
      fundSize: savedState?.fundSize || 100000,
      baseIncomePerSecond: savedState?.baseIncomePerSecond || 2,
      tapBoostPercent: 0,
      tapBoostMaxPercent: 100,
      tapBoostDecayPerSecond: 0.2,
      lastActiveTimestamp: savedState?.lastActiveTimestamp || Date.now(),
      totalEarnedFromIdle: savedState?.totalEarnedFromIdle || 0,
      pendingOfflineEarnings: 0,
      showWelcomeBackModal: false,
      
      rewardedBoosts: savedState?.rewardedBoosts || INITIAL_BOOSTS,
      
      getIncomePerSecond: (careerLevel: CareerLevel) => {
        const { fundSize, tapBoostPercent } = get();
        const base = getBaseIncomeForCareer(careerLevel, fundSize);
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
        const { lastActiveTimestamp, fundSize, rewardedBoosts } = get();
        const now = Date.now();
        const offlineSeconds = Math.min((now - lastActiveTimestamp) / 1000, MAX_OFFLINE_SECONDS);
        
        if (offlineSeconds < 60) {
          set({ pendingOfflineEarnings: 0, showWelcomeBackModal: false });
          return;
        }
        
        const baseIncome = getBaseIncomeForCareer(careerLevel, fundSize);
        
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
      
      increaseFundSize: (amount: number) => {
        set(state => ({
          fundSize: Math.round((state.fundSize + amount) * 100) / 100,
        }));
        get().saveIdleState();
      },
      
      applyTradingPerformance: (dailyReturn: number, portfolioValue: number) => {
        const { fundSize } = get();
        
        if (dailyReturn > 0) {
          const growthFactor = dailyReturn * 0.01;
          const growth = portfolioValue * growthFactor;
          set({ fundSize: Math.round((fundSize + growth) * 100) / 100 });
        } else if (dailyReturn < -0.05) {
          const shrinkFactor = Math.abs(dailyReturn) * 0.005;
          const shrink = fundSize * shrinkFactor;
          set({ fundSize: Math.max(10000, Math.round((fundSize - shrink) * 100) / 100) });
        }
        
        get().saveIdleState();
      },
      
      updateCareerMultiplier: (careerLevel: CareerLevel) => {
        const { fundSize } = get();
        const newBase = getBaseIncomeForCareer(careerLevel, fundSize);
        set({ baseIncomePerSecond: newBase });
        get().saveIdleState();
      },
      
      saveIdleState: () => {
        const state = get();
        setLocalStorage(IDLE_STORAGE_KEY, {
          fundSize: state.fundSize,
          baseIncomePerSecond: state.baseIncomePerSecond,
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
          fundSize: 100000,
          baseIncomePerSecond: 2,
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
