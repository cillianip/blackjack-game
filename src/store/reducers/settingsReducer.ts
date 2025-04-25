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
}

const initialState: SettingsState = {
  soundEnabled: true,
  musicEnabled: true,
  animationSpeed: AnimationSpeed.NORMAL,
  dealerSpeed: AnimationSpeed.NORMAL,
  deckCount: 1
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
    }
  }
});

export const {
  toggleSound,
  toggleMusic,
  setAnimationSpeed,
  setDealerSpeed,
  setDeckCount
} = settingsSlice.actions;
export default settingsSlice.reducer;
