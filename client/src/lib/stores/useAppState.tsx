import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export type ScreenState = "title" | "game" | "tutorial";

export interface Settings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export interface AppState {
  screen: ScreenState;
  tutorialCompleted: boolean;
  tutorialStep: number;
  settings: Settings;
  showSettingsModal: boolean;
  showCreditsModal: boolean;
  showNewGameModal: boolean;
  
  setScreen: (screen: ScreenState) => void;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
  
  toggleSound: () => void;
  toggleHaptic: () => void;
  
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openCreditsModal: () => void;
  closeCreditsModal: () => void;
  openNewGameModal: () => void;
  closeNewGameModal: () => void;
  
  hasSave: () => boolean;
}

const SETTINGS_KEY = "stock-broker-settings";
const TUTORIAL_KEY = "stock-broker-tutorial";
const SAVE_KEY = "stock-broker-game-save";

function loadSettings(): Settings {
  const saved = getLocalStorage(SETTINGS_KEY);
  return saved || { soundEnabled: true, hapticEnabled: true };
}

function loadTutorialCompleted(): boolean {
  const saved = getLocalStorage(TUTORIAL_KEY);
  return saved?.completed || false;
}

export const useAppState = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    screen: "title",
    tutorialCompleted: loadTutorialCompleted(),
    tutorialStep: 0,
    settings: loadSettings(),
    showSettingsModal: false,
    showCreditsModal: false,
    showNewGameModal: false,
    
    setScreen: (screen) => set({ screen }),
    
    startTutorial: () => set({ screen: "tutorial", tutorialStep: 0 }),
    
    nextTutorialStep: () => {
      const { tutorialStep } = get();
      set({ tutorialStep: tutorialStep + 1 });
    },
    
    skipTutorial: () => {
      setLocalStorage(TUTORIAL_KEY, { completed: true });
      set({ 
        tutorialCompleted: true, 
        screen: "game",
        tutorialStep: 0 
      });
    },
    
    completeTutorial: () => {
      setLocalStorage(TUTORIAL_KEY, { completed: true });
      set({ 
        tutorialCompleted: true, 
        screen: "game",
        tutorialStep: 0 
      });
    },
    
    resetTutorial: () => {
      setLocalStorage(TUTORIAL_KEY, { completed: false });
      set({ tutorialCompleted: false, tutorialStep: 0 });
    },
    
    toggleSound: () => {
      const newSettings = { ...get().settings, soundEnabled: !get().settings.soundEnabled };
      setLocalStorage(SETTINGS_KEY, newSettings);
      set({ settings: newSettings });
    },
    
    toggleHaptic: () => {
      const newSettings = { ...get().settings, hapticEnabled: !get().settings.hapticEnabled };
      setLocalStorage(SETTINGS_KEY, newSettings);
      set({ settings: newSettings });
    },
    
    openSettingsModal: () => set({ showSettingsModal: true }),
    closeSettingsModal: () => set({ showSettingsModal: false }),
    openCreditsModal: () => set({ showCreditsModal: true }),
    closeCreditsModal: () => set({ showCreditsModal: false }),
    openNewGameModal: () => set({ showNewGameModal: true }),
    closeNewGameModal: () => set({ showNewGameModal: false }),
    
    hasSave: () => {
      const saved = getLocalStorage(SAVE_KEY);
      return saved !== null && saved !== undefined;
    },
  }))
);
