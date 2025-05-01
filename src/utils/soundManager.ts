/**
 * Sound Manager for the Blackjack game
 * Handles loading, caching, and playing sound effects
 */

// Define sound types as constants to prevent typos
export enum SoundEffect {
  CARD_SHUFFLE = 'shuffle',
  CARD_DEAL = 'deal',
  CARD_FLIP = 'flip',
  CHIP_BET = 'chip',
  CHIP_STACK = 'chip-stack',
  BUTTON_CLICK = 'click',
  WIN = 'win',
  LOSE = 'lose',
  BLACKJACK = 'blackjack',
  PUSH = 'push',
  WARNING = 'warning'
}

// Map sound effects to their file paths
const SOUND_FILES: Record<SoundEffect, string> = {
  [SoundEffect.CARD_SHUFFLE]: '/sounds/shuffle.mp3',
  [SoundEffect.CARD_DEAL]: '/sounds/deal.mp3',
  [SoundEffect.CARD_FLIP]: '/sounds/flip.mp3',
  [SoundEffect.CHIP_BET]: '/sounds/chip.mp3',
  [SoundEffect.CHIP_STACK]: '/sounds/chip-stack.mp3',
  [SoundEffect.BUTTON_CLICK]: '/sounds/click.mp3',
  [SoundEffect.WIN]: '/sounds/win.mp3',
  [SoundEffect.LOSE]: '/sounds/lose.mp3',
  [SoundEffect.BLACKJACK]: '/sounds/blackjack.mp3',
  [SoundEffect.PUSH]: '/sounds/push.mp3',
  [SoundEffect.WARNING]: '/sounds/warning.mp3'
};

class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5; // 0 to 1
  private initialized: boolean = false;

  // Make constructor private to enforce singleton pattern
  private constructor() {}

  // Singleton getInstance method
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  // Initialize and preload sounds
  public init(): Promise<void> {
    if (this.initialized) return Promise.resolve();

    const loadPromises = Object.entries(SOUND_FILES).map(([effect, path]) => {
      return new Promise<void>((resolve) => {
        const audio = new Audio();
        audio.src = path;
        audio.volume = this.volume;
        
        // Preload the audio
        audio.load();
        
        // Store in our sounds map
        this.sounds.set(effect as SoundEffect, audio);
        
        // Consider loading complete even if there's an error
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', () => {
          console.warn(`Failed to load sound: ${path}`);
          resolve();
        });
      });
    });

    return Promise.all(loadPromises).then(() => {
      this.initialized = true;
      console.log('Sound manager initialized successfully');
    });
  }

  // Play a sound effect
  public play(effect: SoundEffect): void {
    if (!this.enabled || !this.initialized) return;

    const sound = this.sounds.get(effect);
    if (!sound) {
      console.warn(`Sound effect not found: ${effect}`);
      return;
    }

    // Clone the audio to allow for overlapping sounds
    const soundClone = sound.cloneNode() as HTMLAudioElement;
    soundClone.volume = this.volume;
    soundClone.play().catch(err => {
      // Browsers may block audio until user interacts with the page
      console.warn(`Error playing sound: ${err}`);
    });
  }

  // Enable or disable all sounds
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // Set volume level (0 to 1)
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all loaded sounds
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
  }

  // Check if sounds are enabled
  public isEnabled(): boolean {
    return this.enabled;
  }

  // Get current volume
  public getVolume(): number {
    return this.volume;
  }
}

// Export a singleton instance
export const soundManager = SoundManager.getInstance();
export default soundManager;