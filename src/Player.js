import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  GAME_SETTINGS,
  MATERIALS,
  MODEL_SETTINGS,
  PLAYER_COLORS,
} from "./constants.js";
import { getPositionFromCell } from "./utils.js";

// Shared GLTF loader instance
const gltfLoader = new GLTFLoader();

// Cache for loaded player model
let playerModelCache = null;
let isLoadingPlayerModel = false;
let loadPlayerModelPromise = null;

/**
 * Player class - Manages 3D player pieces and their state
 */
export class Player {
  constructor(scene, playerNumber, totalPlayers = 2) {
    this.scene = scene;
    this.playerNumber = playerNumber;
    this.totalPlayers = totalPlayers;
    this.colorConfig = PLAYER_COLORS[playerNumber - 1];
    this.group = null;
    this.position = GAME_SETTINGS.PLAYER_START_POSITION;
    this.moves = 0;
    this.snakes = 0;
    this.ladders = 0;
    this.useExternalModel = true; // Set to false to use procedural pieces
  }

  /**
   * Create the 3D player piece
   */
  async create() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0); // Ensure group starts at origin

    // Try to load external model first
    if (this.useExternalModel) {
      const loaded = await this.tryLoadExternalModel();
      if (loaded) {
        this.scene.add(this.group);
        this.updatePosition(GAME_SETTINGS.PLAYER_START_POSITION, false);
        return this.group;
      }
    }

    // Fallback to procedural player piece
    this.createProceduralPiece();
    this.scene.add(this.group);
    this.updatePosition(GAME_SETTINGS.PLAYER_START_POSITION, false);
    return this.group;
  }

  /**
   * Try to load external 3D model
   * @returns {Promise<boolean>} True if successful
   */
  async tryLoadExternalModel() {
    try {
      // Try to load cached model or load new one
      if (!playerModelCache && !isLoadingPlayerModel) {
        isLoadingPlayerModel = true;
        loadPlayerModelPromise = this.loadPlayerModel();
      }

      if (loadPlayerModelPromise) {
        playerModelCache = await loadPlayerModelPromise;
        isLoadingPlayerModel = false;
        loadPlayerModelPromise = null;
      }

      if (playerModelCache) {
        // Clone the model for this player instance
        const playerClone = playerModelCache.clone();

        // Apply player color and setup
        this.setupExternalModel(playerClone);
        this.group.add(playerClone);

        return true;
      }
    } catch (error) {
      console.warn(
        `Failed to load player model for Player ${this.playerNumber}, using procedural:`,
        error.message
      );
      playerModelCache = null;
      isLoadingPlayerModel = false;
      loadPlayerModelPromise = null;
    }

    return false;
  }

  /**
   * Load player 3D model from file
   * @returns {Promise<THREE.Object3D>}
   */
  loadPlayerModel() {
    return new Promise((resolve, reject) => {
      const paths = [
        "/models/player.glb",
        "/models/player.gltf",
        "./models/player.glb",
        "../models/player.glb",
        "/public/models/player.glb",
      ];

      let currentPath = 0;

      const tryLoad = () => {
        if (currentPath >= paths.length) {
          reject(new Error("No player model found in any path"));
          return;
        }

        gltfLoader.load(
          paths[currentPath],
          (gltf) => {
            console.log(`✅ Player model loaded from: ${paths[currentPath]}`);
            resolve(gltf.scene);
          },
          (progress) => {
            // Loading progress
          },
          (error) => {
            currentPath++;
            tryLoad();
          }
        );
      };

      tryLoad();
    });
  }

  /**
   * Setup external model with player colors and properties
   * @param {THREE.Object3D} model - The model to setup
   */
  setupExternalModel(model) {
    const settings = MODEL_SETTINGS.PLAYER;

    // Calculate model size for scaling BEFORE any transformations
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);

    // Scale to target size
    const scale = settings.targetSize / maxSize;
    model.scale.set(scale, scale, scale);

    // Apply rotation offset if needed
    if (settings.rotationOffset !== 0) {
      model.rotation.y = settings.rotationOffset;
    }

    // Apply player color to all meshes
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Apply player color
        if (child.material) {
          // Clone material to avoid affecting other players
          child.material = child.material.clone();
          child.material.color = new THREE.Color(this.colorConfig.main);
          child.material.emissive = new THREE.Color(this.colorConfig.emissive);
          child.material.emissiveIntensity = 0.3;
          child.material.roughness = MATERIALS.PLAYER_PIECE.roughness;
          child.material.metalness = MATERIALS.PLAYER_PIECE.metalness;
          child.material.needsUpdate = true;
        }
      }
    });

    // Center the model on its base (keep Y at 0)
    // Recalculate box after scaling
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    // Only center X and Z, keep Y at minimum (base on ground)
    model.position.x = -center.x;
    model.position.z = -center.z;
    model.position.y = -box.min.y; // Place base at Y=0
  }

  /**
   * Create procedural player piece (fallback)
   */
  createProceduralPiece() {
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.1, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: this.colorConfig.base,
      roughness: 0.3,
      metalness: 0.7,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.05;
    base.castShadow = true;
    this.group.add(base);

    // Main cone piece
    const coneGeometry = new THREE.ConeGeometry(0.15, 0.5, 16);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: this.colorConfig.main,
      ...MATERIALS.PLAYER_PIECE,
      emissive: this.colorConfig.emissive,
      emissiveIntensity: 0.3,
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.y = 0.35;
    cone.castShadow = true;
    this.group.add(cone);

    // Top sphere
    const sphereGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const sphere = new THREE.Mesh(sphereGeometry, coneMaterial);
    sphere.position.y = 0.62;
    sphere.castShadow = true;
    this.group.add(sphere);
  }

  /**
   * Update player position
   * @param {number} cellNumber - Target cell number
   * @param {boolean} animate - Whether to animate the movement
   * @param {Array<Player>} allPlayers - Array of all players (optional, for dynamic spacing)
   */
  updatePosition(cellNumber, animate = true, allPlayers = null) {
    const oldPosition = this.position;
    this.position = cellNumber;
    const pos = getPositionFromCell(cellNumber);

    // Calculate offset based on players in the same cell
    let offset = 0;

    if (allPlayers && allPlayers.length > 1) {
      // Find all players in the same cell (excluding this player if not yet positioned)
      const playersInCell = allPlayers.filter(
        (p) => p && p.position === cellNumber
      );
      const numPlayersInCell = playersInCell.length;

      if (numPlayersInCell > 1) {
        // Find this player's index among players in this cell
        const indexInCell = playersInCell.findIndex(
          (p) => p.playerNumber === this.playerNumber
        );

        // Calculate spacing for players in this cell only
        const maxSpacing = 0.7; // Maximum total spread
        const totalSpacing = Math.min(
          maxSpacing,
          maxSpacing / Math.sqrt(numPlayersInCell / 2)
        );
        const spacingPerPlayer =
          totalSpacing / Math.max(1, numPlayersInCell - 1);

        // Center players around the cell position
        offset = indexInCell * spacingPerPlayer - totalSpacing / 2;
      }
      // If alone in cell, offset stays 0 (centered)
    }

    const heightOffset = MODEL_SETTINGS.PLAYER?.heightOffset || 0.18;

    // Debug logging
    if (!animate) {
      console.log(
        `Player ${
          this.playerNumber
        } at Cell ${cellNumber}, Offset: ${offset.toFixed(3)}, Position: (${(
          pos.x + offset
        ).toFixed(2)}, ${heightOffset}, ${pos.z.toFixed(2)})`
      );
    }

    if (animate) {
      return this.animateToPosition(
        pos.x + offset,
        pos.z,
        oldPosition,
        cellNumber
      );
    } else {
      this.group.position.set(pos.x + offset, heightOffset, pos.z);
      // Set initial rotation to face next cell
      this.rotateToFaceNextCell(cellNumber);
      return Promise.resolve();
    }
  }

  /**
   * Animate player movement to a position
   * @param {number} targetX - Target X position
   * @param {number} targetZ - Target Z position
   * @param {number} oldCell - Previous cell number
   * @param {number} newCell - New cell number
   * @returns {Promise} Promise that resolves when animation completes
   */
  animateToPosition(targetX, targetZ, oldCell, newCell) {
    return new Promise((resolve) => {
      const heightOffset = MODEL_SETTINGS.PLAYER?.heightOffset || 0.18;
      const startPos = {
        x: this.group.position.x,
        z: this.group.position.z,
      };
      const endPos = { x: targetX, z: targetZ };

      // Calculate target rotation based on movement direction
      const targetRotation = this.calculateRotationToFaceCell(oldCell, newCell);
      const startRotation = this.group.rotation.y;

      // Normalize rotation difference to take shortest path
      let rotationDiff = targetRotation - startRotation;
      while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
      while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

      let progress = 0;
      const duration = GAME_SETTINGS.MOVE_ANIMATION_DURATION;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);

        this.group.position.x = startPos.x + (endPos.x - startPos.x) * progress;
        this.group.position.z = startPos.z + (endPos.z - startPos.z) * progress;
        this.group.position.y =
          heightOffset + Math.sin(progress * Math.PI) * 0.25;

        // Smoothly rotate to face movement direction
        this.group.rotation.y = startRotation + rotationDiff * progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Calculate rotation angle to face from one cell to another
   * @param {number} fromCell - Starting cell number
   * @param {number} toCell - Target cell number
   * @returns {number} Rotation angle in radians
   */
  calculateRotationToFaceCell(fromCell, toCell) {
    const fromPos = getPositionFromCell(fromCell);
    const toPos = getPositionFromCell(toCell);

    const dx = toPos.x - fromPos.x;
    const dz = toPos.z - fromPos.z;

    // Calculate angle using atan2 (returns angle in radians)
    // atan2(dz, dx) gives us the angle, but we need to adjust for Three.js coordinate system
    // In Three.js, rotation.y = 0 means facing +Z direction
    // We want the player to face the direction of movement
    const angle = Math.atan2(dx, dz);

    return angle;
  }

  /**
   * Rotate player to face the next cell in sequence
   * @param {number} currentCell - Current cell number
   */
  rotateToFaceNextCell(currentCell) {
    if (!this.group) return;

    // Determine next cell (just increment by 1 for now)
    const nextCell = Math.min(currentCell + 1, GAME_SETTINGS.WINNING_POSITION);

    // Calculate and apply rotation
    const targetRotation = this.calculateRotationToFaceCell(
      currentCell,
      nextCell
    );
    this.group.rotation.y = targetRotation;
  }

  /**
   * Increment move counter
   */
  incrementMoves() {
    this.moves++;
  }

  /**
   * Increment snake counter
   */
  incrementSnakes() {
    this.snakes++;
  }

  /**
   * Increment ladder counter
   */
  incrementLadders() {
    this.ladders++;
  }

  /**
   * Reset player stats
   * @param {Array<Player>} allPlayers - Array of all players (optional, for dynamic spacing)
   */
  reset(allPlayers = null) {
    this.position = GAME_SETTINGS.PLAYER_START_POSITION;
    this.moves = 0;
    this.snakes = 0;
    this.ladders = 0;
    this.updatePosition(GAME_SETTINGS.PLAYER_START_POSITION, false, allPlayers);
  }

  /**
   * Rotate the player piece (for animation)
   * @param {number} deltaY - Rotation amount
   */
  rotate(deltaY) {
    if (this.group) {
      this.group.rotation.y += deltaY;
    }
  }

  /**
   * Remove player from scene
   */
  destroy() {
    if (this.group) {
      this.scene.remove(this.group);
      this.group = null;
    }
  }

  /**
   * Clear the model cache (useful for switching models)
   */
  static clearCache() {
    playerModelCache = null;
    isLoadingPlayerModel = false;
    loadPlayerModelPromise = null;
  }
}
