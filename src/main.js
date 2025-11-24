import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Board } from "./Board.js";
import { GameState } from "./GameState.js";
import { Ladder } from "./Ladder.js";
import { Player } from "./Player.js";
import { Snake } from "./Snake.js";
import { AudioManager } from "./AudioManager.js";
import { SaveManager } from "./SaveManager.js";
import {
  CAMERA_SETTINGS,
  LADDERS,
  PLAYER_COLORS,
  SNAKES,
} from "./constants.js";
import { delay, showMessage } from "./utils.js";

/**
 * Main Game class - Orchestrates the entire game
 */
class Game3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.board = null;
    this.snakes = [];
    this.ladders = [];
    this.players = [];
    this.gameState = null;
    this.numPlayers = 2;
    this.isVsComputer = false; // Track if playing vs computer
    this.audioManager = new AudioManager();
    this.saveManager = new SaveManager();
  }

  /**
   * Initialize the game
   */
  async init(numPlayers, isVsComputer = false) {
    this.numPlayers = numPlayers;
    this.isVsComputer = isVsComputer;
    this.gameState = new GameState(numPlayers);

    // Create scene - Egyptian desert sky
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4d4a8); // Warm desert sky
    this.scene.fog = new THREE.Fog(0xf4d4a8, 25, 60);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_SETTINGS.FOV,
      window.innerWidth / window.innerHeight,
      CAMERA_SETTINGS.NEAR,
      CAMERA_SETTINGS.FAR
    );
    this.camera.position.set(
      CAMERA_SETTINGS.DEFAULT_POSITION.x,
      CAMERA_SETTINGS.DEFAULT_POSITION.y,
      CAMERA_SETTINGS.DEFAULT_POSITION.z
    );
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document
      .getElementById("canvas-container")
      .appendChild(this.renderer.domElement);

    // Add controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1;

    // Zoom limits
    this.controls.minDistance = CAMERA_SETTINGS.MIN_ZOOM_DISTANCE;
    this.controls.maxDistance = CAMERA_SETTINGS.MAX_ZOOM_DISTANCE;

    // Setup lights
    this.setupLights();

    // Add ground (disabled)
    // this.addGround();

    // Create board elements
    this.board = new Board(this.scene);
    this.board.create();

    // Create snakes (with async support for external models)
    const snakePromises = [];
    for (const [start, end] of Object.entries(SNAKES)) {
      const snake = new Snake(this.scene, parseInt(start), parseInt(end));
      snakePromises.push(snake.create());
      this.snakes.push(snake);
    }

    // Wait for all snakes to load
    await Promise.all(snakePromises);

    // Create ladders
    for (const [start, end] of Object.entries(LADDERS)) {
      const ladder = new Ladder(this.scene, parseInt(start), parseInt(end));
      ladder.create();
      this.ladders.push(ladder);
    }

    // Create players (with async support for external models)
    const playerPromises = [];
    for (let i = 1; i <= numPlayers; i++) {
      const player = new Player(this.scene, i, numPlayers); // Pass total number of players
      playerPromises.push(player.create());
      this.players.push(player);
    }

    // Wait for all players to load
    await Promise.all(playerPromises);

    // Reposition all players with proper spacing (now that all players exist)
    for (const player of this.players) {
      player.updatePosition(player.position, false, this.players);
    }

    // Setup UI
    this.setupUI();

    // Start background music
    this.audioManager.startBackgroundMusic();

    // Window resize handler
    window.addEventListener("resize", () => this.onWindowResize());

    // Start animation loop
    this.animate();
    
    // Try to load saved game state after a short delay (async, non-blocking)
    setTimeout(() => {
      this.loadGameState().then((wasLoaded) => {
        if (!wasLoaded) {
          this.saveGameState();
        }
      }).catch(error => {
        console.error('Error loading game state:', error);
      });
    }, 100);
  }

  /**
   * Save current game state to localStorage
   */
  saveGameState() {
    const gameData = {
      numPlayers: this.numPlayers,
      isVsComputer: this.isVsComputer,
      currentPlayer: this.gameState.currentPlayer,
      gameOver: this.gameState.gameOver,
      winner: this.gameState.winner,
      players: this.players.map(player => ({
        playerNumber: player.playerNumber,
        position: player.position,
        moves: player.moves,
        snakes: player.snakes,
        ladders: player.ladders,
      }))
    };
    this.saveManager.saveGame(gameData);
  }

  /**
   * Load saved game state from localStorage
   * @returns {boolean} True if save was loaded successfully
   */
  async loadGameState() {
    try {
      const savedData = this.saveManager.loadGame();
      if (savedData && savedData.players) {
        // Validate save data matches current game setup
        if (savedData.numPlayers !== this.numPlayers || 
            savedData.players.length !== this.players.length) {
          console.warn('Save data mismatch, clearing save');
          this.saveManager.clearSave();
          return false;
        }

        // Restore game state
        this.gameState.currentPlayer = savedData.currentPlayer || 1;
        this.gameState.gameOver = savedData.gameOver || false;
        this.gameState.winner = savedData.winner || null;

        // Restore player states
        savedData.players.forEach((savedPlayer, index) => {
          if (this.players[index]) {
            this.players[index].position = savedPlayer.position;
            this.players[index].moves = savedPlayer.moves;
            this.players[index].snakes = savedPlayer.snakes;
            this.players[index].ladders = savedPlayer.ladders;
            // Update player position without animation
            this.players[index].updatePosition(savedPlayer.position, false, this.players);
          }
        });

        // Update UI with loaded state
        this.updateUI();
        
        // Show restoration message
        const totalMoves = savedData.players.reduce((sum, p) => sum + p.moves, 0);
        showMessage(`✨ Game Restored! ${totalMoves} move${totalMoves !== 1 ? 's' : ''} played.`);
        
        // If it's computer's turn, trigger roll after delay
        if (this.isVsComputer && this.gameState.currentPlayer === 2 && !this.gameState.gameOver) {
          await delay(2000); // Give time to see restored state
          await this.handleDiceRoll();
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error loading game state:', error);
      // Clear corrupted save
      this.saveManager.clearSave();
    }
    return false;
  }

  /**
   * Setup lighting
   */
  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 0.6);
    pointLight1.position.set(-5, 8, -5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.4);
    pointLight2.position.set(5, 6, -5);
    this.scene.add(pointLight2);
  }

  /**
   * Add ground plane
   */
  addGround() {
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x88cc88,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  /**
   * Setup UI elements
   */
  setupUI() {
    // Create player cards
    const playersPanel = document.getElementById("players-panel");
    playersPanel.innerHTML = "";

    for (let i = 1; i <= this.numPlayers; i++) {
      const colorConfig = PLAYER_COLORS[i - 1];
      const card = this.createPlayerCard(i, colorConfig);
      playersPanel.appendChild(card);
    }

    // Update current player display
    this.updateUI();

    // Setup button handlers
    this.setupButtonHandlers();
  }

  /**
   * Create a player card element
   */
  createPlayerCard(playerNum, colorConfig) {
    const card = document.createElement("div");
    card.className = `player-card ${playerNum === 1 ? "active" : ""}`;
    card.id = `player-${playerNum}-card`;

    const color = `#${colorConfig.main.toString(16).padStart(6, "0")}`;
    const playerName = this.isVsComputer && playerNum === 2 ? "🤖 Computer" : `Player ${playerNum}`;

    card.innerHTML = `
      <div class="player-header">
        <div class="player-avatar" style="background: ${color};"></div>
        <div class="player-info">
          <h3>${playerName}</h3>
          <p class="position">Position: <span id="player-${playerNum}-pos">1</span></p>
        </div>
      </div>
      <div class="player-stats">
        <div class="stat">
          <span class="stat-label">Moves:</span>
          <span class="stat-value" id="player-${playerNum}-moves">0</span>
        </div>
        <div class="stat">
          <span class="stat-label">Snakes:</span>
          <span class="stat-value" id="player-${playerNum}-snakes">0</span>
        </div>
        <div class="stat">
          <span class="stat-label">Ladders:</span>
          <span class="stat-value" id="player-${playerNum}-ladders">0</span>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Setup button event handlers
   */
  setupButtonHandlers() {
    // Roll dice button
    document
      .getElementById("roll-button")
      .addEventListener("click", async () => {
        this.audioManager.playClick();
        await this.handleDiceRoll();
      });

    // Pause button
    document.getElementById("pause-btn").addEventListener("click", () => {
      this.audioManager.playClick();
      this.pauseGame();
    });

    // Resume button (from pause menu)
    document.getElementById("resume-btn").addEventListener("click", () => {
      this.audioManager.playClick();
      this.resumeGame();
    });

    // Help button (from pause menu)
    document.getElementById("pause-help-btn").addEventListener("click", () => {
      this.audioManager.playClick();
      document.getElementById("pause-menu").classList.remove("show");
      document.getElementById("info-modal").classList.add("show");
    });

    // Restart button (from pause menu)
    document
      .getElementById("pause-restart-btn")
      .addEventListener("click", () => {
        this.audioManager.playClick();
        this.showConfirmDialog(
          "🔄",
          "Restart Game?",
          "All current progress will be lost. Are you sure you want to restart?",
          () => {
            this.restartGame();
            document.getElementById("pause-menu").classList.remove("show");
          }
        );
      });

    // Exit button (from pause menu)
    document.getElementById("exit-btn").addEventListener("click", () => {
      this.audioManager.playClick();
      this.showConfirmDialog(
        "🚪",
        "Exit to Main Menu?",
        "Your current game will be lost. Do you want to exit?",
        () => {
          this.exitToMainMenu();
        },
        true
      );
    });

    // Toggle camera button
    document
      .getElementById("toggle-camera-btn")
      .addEventListener("click", () => {
        this.audioManager.playClick();
        this.toggleCameraView();
      });

    // Sound toggle button
    document
      .getElementById("sound-toggle-btn")
      .addEventListener("click", () => {
        const enabled = this.audioManager.toggle();
        const soundIcon = document.getElementById("sound-icon");
        soundIcon.textContent = enabled ? "🔊" : "🔇";
        if (enabled) {
          this.audioManager.playClick();
        }
      });

    // Close modal buttons
    document.getElementById("close-modal").addEventListener("click", () => {
      this.audioManager.playClick();
      document.getElementById("info-modal").classList.remove("show");
    });

    document.getElementById("play-again-btn").addEventListener("click", () => {
      this.audioManager.playClick();
      this.restartGame();
      document.getElementById("winner-modal").classList.remove("show");
    });

    // ESC key to pause/resume
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const pauseMenu = document.getElementById("pause-menu");
        if (pauseMenu.classList.contains("show")) {
          this.resumeGame();
        } else if (!this.gameState.gameOver) {
          this.pauseGame();
        }
      }
    });

    // Click outside modal to close
    window.addEventListener("click", (e) => {
      const infoModal = document.getElementById("info-modal");
      if (e.target === infoModal) {
        infoModal.classList.remove("show");
      }
    });
  }

  /**
   * Show confirmation dialog
   * @param {string} icon - Emoji icon
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {Function} onConfirm - Callback on confirm
   * @param {boolean} isDanger - Whether this is a dangerous action
   */
  showConfirmDialog(icon, title, message, onConfirm, isDanger = false) {
    const modal = document.getElementById("confirm-modal");
    const iconEl = document.getElementById("confirm-icon");
    const titleEl = document.getElementById("confirm-title");
    const messageEl = document.getElementById("confirm-message");
    const confirmBtn = document.getElementById("confirm-yes");
    const cancelBtn = document.getElementById("confirm-cancel");

    // Set content
    iconEl.textContent = icon;
    titleEl.textContent = title;
    messageEl.textContent = message;

    // Set danger style
    if (isDanger) {
      confirmBtn.classList.add("danger");
    } else {
      confirmBtn.classList.remove("danger");
    }

    // Show modal
    modal.classList.add("show");

    // Handle confirm
    const handleConfirm = () => {
      this.audioManager.playClick();
      modal.classList.remove("show");
      onConfirm();
      cleanup();
    };

    // Handle cancel
    const handleCancel = () => {
      this.audioManager.playClick();
      modal.classList.remove("show");
      cleanup();
    };

    // Cleanup listeners
    const cleanup = () => {
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
    };

    // Add listeners
    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
  }

  /**
   * Pause the game
   */
  pauseGame() {
    if (!this.gameState.gameOver && !this.gameState.isMoving) {
      document.getElementById("pause-menu").classList.add("show");
      document.getElementById("roll-button").disabled = true;
    }
  }

  /**
   * Resume the game
   */
  resumeGame() {
    document.getElementById("pause-menu").classList.remove("show");
    document.getElementById("roll-button").disabled =
      this.gameState.isMoving || this.gameState.gameOver;
  }

  /**
   * Exit to main menu
   */
  exitToMainMenu() {
    // Clear saved game
    this.saveManager.clearSave();
    
    // Clean up
    this.cleanup();

    // Hide game, show menu
    document.getElementById("game-container").classList.add("hidden");
    document.getElementById("pause-menu").classList.remove("show");
    document.getElementById("start-menu").classList.remove("hidden");

    // Reset selection (will be handled by re-initialization if needed)
    document.getElementById("player-count").textContent = "2";
  }

  /**
   * Clean up game resources
   */
  cleanup() {
    // Remove event listeners would go here
    // Clean up Three.js objects
    if (this.renderer) {
      this.renderer.dispose();
      const canvas = this.renderer.domElement;
      if (canvas && canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }
    }

    // Clear arrays
    this.snakes = [];
    this.ladders = [];
    this.players = [];
  }

  /**
   * Handle dice roll
   */
  async handleDiceRoll() {
    if (
      this.gameState.isRolling ||
      this.gameState.isMoving ||
      this.gameState.gameOver
    ) {
      return;
    }

    this.gameState.isRolling = true;
    document.getElementById("roll-button").disabled = true;

    const diceValue = await this.rollDice();
    const playerName = this.isVsComputer && this.gameState.currentPlayer === 2 
      ? "Computer" 
      : `Player ${this.gameState.currentPlayer}`;
    showMessage(`${playerName} rolled ${diceValue}!`);

    await delay(800);

    const player = this.players[this.gameState.currentPlayer - 1];
    const result = await this.gameState.handleMove(player, diceValue, this.players, this.audioManager);

    if (result.won) {
      this.showWinner(this.gameState.winner);
      // Clear save when game is won
      this.saveManager.clearSave();
    } else {
      // Switch player whether move was valid or invalid
      // If invalid (can't reach exactly 100), player loses their turn
      await delay(500);
      this.gameState.switchPlayer();
      
      // Save game state after each move (only if game continues)
      this.saveGameState();
    }

    this.updateUI();
    this.gameState.isRolling = false;
    document.getElementById("roll-button").disabled = this.gameState.gameOver;

    // If it's now the computer's turn, automatically roll after a short delay
    if (this.isVsComputer && this.gameState.currentPlayer === 2 && !this.gameState.gameOver) {
      await delay(1000); // Give user time to see the transition
      await this.handleDiceRoll(); // Computer rolls automatically
    }
  }

  /**
   * Roll dice with animation
   */
  rollDice() {
    return new Promise((resolve) => {
      const diceDisplay = document.getElementById("dice-display");
      const diceValue = document.querySelector(".dice-value");

      // Play dice roll sound
      this.audioManager.playDiceRoll();
      
      diceDisplay.classList.add("rolling");

      let rolls = 0;
      const rollInterval = setInterval(() => {
        diceValue.textContent = Math.floor(Math.random() * 6) + 1;
        rolls++;

        if (rolls >= 10) {
          clearInterval(rollInterval);
          const finalValue = Math.floor(Math.random() * 6) + 1;
          diceValue.textContent = finalValue;
          diceDisplay.classList.remove("rolling");
          resolve(finalValue);
        }
      }, 100);
    });
  }

  /**
   * Update UI elements
   */
  updateUI() {
    // Update current player
    const playerName = this.isVsComputer && this.gameState.currentPlayer === 2 
      ? "🤖 Computer" 
      : `Player ${this.gameState.currentPlayer}`;
    document.getElementById("current-player-name").textContent = playerName;

    // Update player cards
    for (let i = 1; i <= this.numPlayers; i++) {
      const card = document.getElementById(`player-${i}-card`);
      card.classList.toggle("active", i === this.gameState.currentPlayer);

      const player = this.players[i - 1];
      document.getElementById(`player-${i}-pos`).textContent = player.position;
      document.getElementById(`player-${i}-moves`).textContent = player.moves;
      document.getElementById(`player-${i}-snakes`).textContent = player.snakes;
      document.getElementById(`player-${i}-ladders`).textContent =
        player.ladders;
    }

    // Enable/disable roll button
    const rollButton = document.getElementById("roll-button");
    
    // Disable button if it's the computer's turn or game is over/moving
    const isComputerTurn = this.isVsComputer && this.gameState.currentPlayer === 2;
    rollButton.disabled = this.gameState.isMoving || this.gameState.gameOver || isComputerTurn;
    
    // Update button text when it's computer's turn
    const buttonText = rollButton.querySelector("span");
    if (isComputerTurn) {
      buttonText.textContent = "🤖 Computer's Turn";
    } else {
      buttonText.textContent = "🎲 Roll Dice";
    }
  }

  /**
   * Show winner modal
   */
  showWinner(playerNumber) {
    const modal = document.getElementById("winner-modal");
    const winnerText = document.getElementById("winner-text");
    const winnerName = this.isVsComputer && playerNumber === 2 
      ? "🤖 Computer" 
      : `Player ${playerNumber}`;
    winnerText.textContent = `${winnerName} Wins! 🎉`;
    modal.classList.add("show");
    
    // Play win sound
    this.audioManager.playWin();
  }

  /**
   * Restart the game
   */
  async restartGame() {
    // Clear saved game
    this.saveManager.clearSave();
    
    this.gameState.reset();
    document.querySelector(".dice-value").textContent = "?";

    for (const player of this.players) {
      player.reset(this.players);
    }

    this.updateUI();
    
    // Save initial game state
    this.saveGameState();
    
    // If it's computer's turn after restart, trigger roll
    if (this.isVsComputer && this.gameState.currentPlayer === 2 && !this.gameState.gameOver) {
      await delay(1000);
      await this.handleDiceRoll();
    }
  }

  /**
   * Toggle camera view
   */
  toggleCameraView() {
    const currentPos = this.camera.position.clone();

    if (Math.abs(currentPos.x - 8) < 1) {
      this.camera.position.set(
        CAMERA_SETTINGS.SIDE_VIEW.x,
        CAMERA_SETTINGS.SIDE_VIEW.y,
        CAMERA_SETTINGS.SIDE_VIEW.z
      );
    } else if (Math.abs(currentPos.z - 12) < 1) {
      this.camera.position.set(
        CAMERA_SETTINGS.TOP_VIEW.x,
        CAMERA_SETTINGS.TOP_VIEW.y,
        CAMERA_SETTINGS.TOP_VIEW.z
      );
    } else {
      this.camera.position.set(
        CAMERA_SETTINGS.DEFAULT_POSITION.x,
        CAMERA_SETTINGS.DEFAULT_POSITION.y,
        CAMERA_SETTINGS.DEFAULT_POSITION.z
      );
    }

    this.camera.lookAt(0, 0, 0);
    this.controls.update();
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    if (this.controls) {
      this.controls.update();
    }

    // Rotate player pieces (disabled for 3D models)
    // for (const player of this.players) {
    //   player.rotate(0.015);
    // }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Start Menu Handler
let selectedPlayers = 2;
let selectedMode = "computer"; // "computer" or "multiplayer"
let game = null;
let menuAudio = null; // Audio manager for menu

window.addEventListener("DOMContentLoaded", () => {
  const startMenu = document.getElementById("start-menu");
  const gameContainer = document.getElementById("game-container");
  const startBtn = document.getElementById("start-game-btn");
  const continueBtn = document.getElementById("continue-game-btn");
  const decreaseBtn = document.getElementById("decrease-players");
  const increaseBtn = document.getElementById("increase-players");
  const playerCountDisplay = document.getElementById("player-count");
  const playerSelection = document.getElementById("player-selection");
  const modeVsComputer = document.getElementById("mode-vs-computer");
  const modeMultiplayer = document.getElementById("mode-multiplayer");

  // Initialize audio manager and save manager for menu
  menuAudio = new AudioManager();
  const saveManager = new SaveManager();

  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 7;

  // Check for saved game and show continue button
  if (saveManager.hasSavedGame()) {
    continueBtn.style.display = "block";
    const saveTime = saveManager.getFormattedSaveTime();
    if (saveTime) {
      continueBtn.querySelector("span").textContent = `⏩ Continue Game (${saveTime})`;
    }
  }

  // Handle mode selection
  function selectMode(mode) {
    selectedMode = mode;
    
    // Update button states
    modeVsComputer.classList.toggle("active", mode === "computer");
    modeMultiplayer.classList.toggle("active", mode === "multiplayer");
    
    // Show/hide player selection based on mode
    if (mode === "computer") {
      playerSelection.style.display = "none";
      selectedPlayers = 2; // Always 2 players in vs computer mode
    } else {
      playerSelection.style.display = "block";
      updateButtons();
    }
  }

  // Mode buttons
  modeVsComputer.addEventListener("click", () => {
    menuAudio.playClick();
    selectMode("computer");
  });
  modeMultiplayer.addEventListener("click", () => {
    menuAudio.playClick();
    selectMode("multiplayer");
  });

  // Update button states
  function updateButtons() {
    decreaseBtn.disabled = selectedPlayers <= MIN_PLAYERS;
    increaseBtn.disabled = selectedPlayers >= MAX_PLAYERS;
    playerCountDisplay.textContent = selectedPlayers;
  }

  // Decrease players
  decreaseBtn.addEventListener("click", () => {
    if (selectedPlayers > MIN_PLAYERS) {
      menuAudio.playClick();
      selectedPlayers--;
      updateButtons();
    }
  });

  // Increase players
  increaseBtn.addEventListener("click", () => {
    if (selectedPlayers < MAX_PLAYERS) {
      menuAudio.playClick();
      selectedPlayers++;
      updateButtons();
    }
  });

  // Initialize
  selectMode("computer"); // Default to vs computer mode
  updateButtons();
  startBtn.disabled = false;

  // Continue game
  continueBtn.addEventListener("click", async () => {
    menuAudio.playClick();
    
    // Load saved game data to get settings
    const savedData = saveManager.loadGame();
    
    if (savedData) {
      selectedPlayers = savedData.numPlayers || 2;
      selectedMode = savedData.isVsComputer ? "computer" : "multiplayer";
      
      startMenu.classList.add("hidden");
      gameContainer.classList.remove("hidden");

      game = new Game3D();
      const isVsComputer = savedData.isVsComputer || false;
      await game.init(selectedPlayers, isVsComputer);
    }
  });

  // Start game
  startBtn.addEventListener("click", async () => {
    if (selectedPlayers >= MIN_PLAYERS && selectedPlayers <= MAX_PLAYERS) {
      menuAudio.playClick();
      
      // Clear any existing save when starting new game
      saveManager.clearSave();
      
      startMenu.classList.add("hidden");
      gameContainer.classList.remove("hidden");

      game = new Game3D();
      const isVsComputer = selectedMode === "computer";
      await game.init(selectedPlayers, isVsComputer);
    }
  });
});
