/**
 * SaveManager - Handles saving and loading game state
 */
export class SaveManager {
  constructor() {
    this.SAVE_KEY = 'snakeLadder_gameState';
  }

  /**
   * Save current game state
   * @param {Object} gameData - Game data to save
   */
  saveGame(gameData) {
    try {
      const saveData = {
        timestamp: Date.now(),
        ...gameData
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.error('Error saving game:', error);
    }
  }

  /**
   * Load saved game state
   * @returns {Object|null} Saved game data or null if no save exists
   */
  loadGame() {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
    return null;
  }

  /**
   * Check if a saved game exists
   * @returns {boolean} True if save exists
   */
  hasSavedGame() {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * Clear saved game
   */
  clearSave() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
    } catch (error) {
      console.error('Error clearing save:', error);
    }
  }

  /**
   * Get save timestamp
   * @returns {number|null} Timestamp of save or null
   */
  getSaveTimestamp() {
    const savedData = this.loadGame();
    return savedData ? savedData.timestamp : null;
  }

  /**
   * Format save time for display
   * @returns {string} Formatted save time
   */
  getFormattedSaveTime() {
    const timestamp = this.getSaveTimestamp();
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }
}

