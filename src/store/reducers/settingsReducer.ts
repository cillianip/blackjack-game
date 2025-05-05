import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum AnimationSpeed {
  FAST = 'fast',
  NORMAL = 'normal',
  SLOW = 'slow'
}

interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: AnimationSpeed;
  dealerSpeed: AnimationSpeed;
  deckCount: number;
  dealerHitSoft17: boolean;
}

const initialState: SettingsState = {
  soundEnabled: true,
  musicEnabled: true,
  animationSpeed: AnimationSpeed.NORMAL,
  dealerSpeed: AnimationSpeed.NORMAL,
  deckCount: 1,
  dealerHitSoft17: true // Vegas rules typically have dealer hit on soft 17
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    },
    toggleMusic(state) {
      state.musicEnabled = !state.musicEnabled;
    },
    setAnimationSpeed(state, action: PayloadAction<AnimationSpeed>) {
      state.animationSpeed = action.payload;
    },
    setDealerSpeed(state, action: PayloadAction<AnimationSpeed>) {
      state.dealerSpeed = action.payload;
    },
    setDeckCount(state, action: PayloadAction<number>) {
      state.deckCount = action.payload;
    },
    toggleDealerHitSoft17(state) {
      state.dealerHitSoft17 = !state.dealerHitSoft17;
    }
  }
});

export const {
  toggleSound,
  toggleMusic,
  setAnimationSpeed,
  setDealerSpeed,
  setDeckCount,
  toggleDealerHitSoft17
} = settingsSlice.actions;
export default settingsSlice.reducer;
