/**
 * AudioManager - Manages all game sounds and music
 */
export class AudioManager {
  constructor() {
    this.enabled = true;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    
    // Initialize audio elements
    this.bgMusic = document.getElementById('bg-music');
    this.clickSound = document.getElementById('click-sound');
    this.diceRollSound = document.getElementById('dice-roll-sound');
    this.moveSound = document.getElementById('move-sound');
    this.ladderSound = document.getElementById('ladder-sound');
    this.snakeSound = document.getElementById('snake-sound');
    this.winSound = document.getElementById('win-sound');
    
    // Set volumes
    if (this.bgMusic) this.bgMusic.volume = this.musicVolume;
    if (this.clickSound) this.clickSound.volume = this.sfxVolume;
    if (this.diceRollSound) this.diceRollSound.volume = this.sfxVolume;
    if (this.moveSound) this.moveSound.volume = this.sfxVolume * 0.7;
    if (this.ladderSound) this.ladderSound.volume = this.sfxVolume;
    if (this.snakeSound) this.snakeSound.volume = this.sfxVolume;
    if (this.winSound) this.winSound.volume = this.sfxVolume;
    
    // Check if user has previously muted
    const savedState = localStorage.getItem('soundEnabled');
    if (savedState !== null) {
      this.enabled = savedState === 'true';
    }
    
    // Auto-play background music on first user interaction
    this.hasStarted = false;
  }

  /**
   * Start background music
   */
  startBackgroundMusic() {
    if (this.enabled && this.bgMusic && !this.hasStarted) {
      this.bgMusic.play().catch(err => {
        console.log('Background music autoplay prevented:', err.message);
      });
      this.hasStarted = true;
    }
  }

  /**
   * Play click sound
   */
  playClick() {
    if (this.enabled && this.clickSound) {
      this.clickSound.currentTime = 0;
      this.clickSound.play().catch(err => {
        // Silently handle if sound file not found
        console.log('Click sound error:', err.message);
      });
    }
  }

  /**
   * Play dice roll sound
   */
  playDiceRoll() {
    if (this.enabled && this.diceRollSound) {
      this.diceRollSound.currentTime = 0;
      this.diceRollSound.play().catch(err => {
        console.log('Dice roll sound error:', err.message);
      });
    }
  }

  /**
   * Play move sound
   */
  playMove() {
    if (this.enabled && this.moveSound) {
      this.moveSound.currentTime = 0;
      this.moveSound.play().catch(err => {
        console.log('Move sound error:', err.message);
      });
    }
  }

  /**
   * Play ladder climb sound
   */
  playLadder() {
    if (this.enabled && this.ladderSound) {
      this.ladderSound.currentTime = 0;
      this.ladderSound.play().catch(err => {
        console.log('Ladder sound error:', err.message);
      });
    }
  }

  /**
   * Play snake slide sound
   */
  playSnake() {
    if (this.enabled && this.snakeSound) {
      this.snakeSound.currentTime = 0;
      this.snakeSound.play().catch(err => {
        console.log('Snake sound error:', err.message);
      });
    }
  }

  /**
   * Play win sound
   */
  playWin() {
    if (this.enabled && this.winSound) {
      this.winSound.currentTime = 0;
      this.winSound.play().catch(err => {
        console.log('Win sound error:', err.message);
      });
    }
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled.toString());
    
    if (this.enabled) {
      this.startBackgroundMusic();
    } else {
      if (this.bgMusic) {
        this.bgMusic.pause();
      }
    }
    
    return this.enabled;
  }

  /**
   * Set music volume
   * @param {number} volume - Volume level (0-1)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.musicVolume;
    }
  }

  /**
   * Set sound effects volume
   * @param {number} volume - Volume level (0-1)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.clickSound) this.clickSound.volume = this.sfxVolume;
    if (this.diceRollSound) this.diceRollSound.volume = this.sfxVolume;
    if (this.moveSound) this.moveSound.volume = this.sfxVolume * 0.7;
    if (this.ladderSound) this.ladderSound.volume = this.sfxVolume;
    if (this.snakeSound) this.snakeSound.volume = this.sfxVolume;
    if (this.winSound) this.winSound.volume = this.sfxVolume;
  }

  /**
   * Stop all sounds
   */
  stopAll() {
    if (this.bgMusic) this.bgMusic.pause();
    if (this.clickSound) this.clickSound.pause();
    if (this.diceRollSound) this.diceRollSound.pause();
    if (this.moveSound) this.moveSound.pause();
    if (this.ladderSound) this.ladderSound.pause();
    if (this.snakeSound) this.snakeSound.pause();
    if (this.winSound) this.winSound.pause();
  }

  /**
   * Check if audio is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

