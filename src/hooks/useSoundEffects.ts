import { useEffect } from 'react';
import soundManager, { SoundEffect } from '../utils/soundManager';

// Custom hook to set up and use sound effects in components
export const useSoundEffects = (enabled: boolean = true) => {
  // Initialize the sound manager
  useEffect(() => {
    // We initialize on component mount, this loads all the sounds
    soundManager.init().catch(err => {
      console.error('Failed to initialize sound manager:', err);
    });
    
    // Update the enabled state
    soundManager.setEnabled(enabled);
    
    // No cleanup needed - the sound manager is a singleton
  }, []);
  
  // Update enabled state when it changes
  useEffect(() => {
    soundManager.setEnabled(enabled);
  }, [enabled]);
  
  // Return a convenience function to play sounds
  const playSound = (effect: SoundEffect) => {
    soundManager.play(effect);
  };
  
  return { playSound };
};

// This function can be directly imported and used where needed
export const playSound = (effect: SoundEffect) => {
  soundManager.play(effect);
};

export default useSoundEffects;