import { useEffect, useRef } from "react";
import { useIdleIncome } from "@/lib/stores/useIdleIncome";
import { useStockGame } from "@/lib/stores/useStockGame";

export function useIdleGameLoop() {
  const lastTickRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const careerLevel = useStockGame(state => state.getCareerLevel());
  const tickIdle = useIdleIncome(state => state.tickIdle);
  const decayTapBoost = useIdleIncome(state => state.decayTapBoost);
  const saveIdleState = useIdleIncome(state => state.saveIdleState);
  const calculateOfflineEarnings = useIdleIncome(state => state.calculateOfflineEarnings);
  
  useEffect(() => {
    calculateOfflineEarnings(careerLevel);
  }, []);
  
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      
      const income = tickIdle(careerLevel);
      
      useStockGame.setState(state => ({
        cash: Math.round((state.cash + income) * 100) / 100,
      }));
      
      decayTapBoost(deltaSeconds);
      
      if (Math.random() < 0.1) {
        saveIdleState();
      }
    };
    
    intervalRef.current = setInterval(tick, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      saveIdleState();
    };
  }, [careerLevel, tickIdle, decayTapBoost, saveIdleState]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveIdleState();
        useIdleIncome.getState().updateLastActive();
      } else {
        calculateOfflineEarnings(careerLevel);
        lastTickRef.current = Date.now();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [careerLevel, saveIdleState, calculateOfflineEarnings]);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveIdleState();
      useIdleIncome.getState().updateLastActive();
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveIdleState]);
}
