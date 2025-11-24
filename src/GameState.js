import { SNAKES, LADDERS, GAME_SETTINGS } from './constants.js';
import { delay, showMessage } from './utils.js';

/**
 * GameState class - Manages game state and logic
 */
export class GameState {
  constructor(numPlayers = 2) {
    this.numPlayers = numPlayers;
    this.currentPlayer = 1;
    this.isRolling = false;
    this.isMoving = false;
    this.gameOver = false;
    this.winner = null;
  }

  /**
   * Switch to next player
   */
  switchPlayer() {
    this.currentPlayer = (this.currentPlayer % this.numPlayers) + 1;
  }

  /**
   * Check if position has a snake
   * @param {number} position - Board position
   * @returns {number|null} Snake end position or null
   */
  getSnakeEnd(position) {
    return SNAKES[position] || null;
  }

  /**
   * Check if position has a ladder
   * @param {number} position - Board position
   * @returns {number|null} Ladder end position or null
   */
  getLadderEnd(position) {
    return LADDERS[position] || null;
  }

  /**
   * Check if a move would exceed winning position
   * @param {number} currentPos - Current position
   * @param {number} diceValue - Dice roll value
   * @returns {boolean} True if move is valid
   */
  isValidMove(currentPos, diceValue) {
    return currentPos + diceValue <= GAME_SETTINGS.WINNING_POSITION;
  }

  /**
   * Check if player has won
   * @param {number} position - Player position
   * @returns {boolean} True if player won
   */
  hasWon(position) {
    return position === GAME_SETTINGS.WINNING_POSITION;
  }

  /**
   * Handle player move logic
   * @param {Object} player - Player object
   * @param {number} diceValue - Dice roll value
   * @param {Array<Player>} allPlayers - Array of all players
   * @param {Object} audioManager - Audio manager for sound effects
   * @returns {Promise<Object>} Move result object
   */
  async handleMove(player, diceValue, allPlayers = null, audioManager = null) {
    this.isMoving = true;
    const currentPos = player.position;
    const newPos = currentPos + diceValue;

    // Check if move is valid
    if (!this.isValidMove(currentPos, diceValue)) {
      this.isMoving = false;
      showMessage("Need exact roll to win! Turn skipped.");
      await delay(1500);
      return { valid: false, won: false };
    }

    // Move step by step
    for (let i = currentPos + 1; i <= newPos; i++) {
      await player.updatePosition(i, true, allPlayers);
      await delay(200);
    }

    player.incrementMoves();

    // Check for snake
    const snakeEnd = this.getSnakeEnd(newPos);
    if (snakeEnd) {
      showMessage(`🐍 Snake! Moving down to ${snakeEnd}`);
      player.incrementSnakes();
      
      // Wait a bit before playing sound and moving
      await delay(500);
      
      // Play snake sound during movement
      if (audioManager) {
        audioManager.playSnake();
      }
      
      await delay(500);
      await player.updatePosition(snakeEnd, true, allPlayers);
      this.isMoving = false;
      return { valid: true, won: false, snakeEnd };
    }

    // Check for ladder
    const ladderEnd = this.getLadderEnd(newPos);
    if (ladderEnd) {
      showMessage(`🪜 Ladder! Climbing up to ${ladderEnd}`);
      player.incrementLadders();
      
      // Wait a bit before playing sound and moving
      await delay(500);
      
      // Play ladder sound during movement
      if (audioManager) {
        audioManager.playLadder();
      }
      
      await delay(500);
      await player.updatePosition(ladderEnd, true, allPlayers);
      
      // Check if won after ladder
      if (this.hasWon(player.position)) {
        this.gameOver = true;
        this.winner = player.playerNumber;
        this.isMoving = false;
        return { valid: true, won: true };
      }
    }

    // Check if won
    if (this.hasWon(player.position)) {
      this.gameOver = true;
      this.winner = player.playerNumber;
      this.isMoving = false;
      return { valid: true, won: true };
    }

    this.isMoving = false;
    return { valid: true, won: false };
  }

  /**
   * Reset game state
   */
  reset() {
    this.currentPlayer = 1;
    this.isRolling = false;
    this.isMoving = false;
    this.gameOver = false;
    this.winner = null;
  }
}

