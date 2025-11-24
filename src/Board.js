import * as THREE from "three";
import { BOARD_CONFIG, CELL_COLORS, MATERIALS } from "./constants.js";
import { createWoodTexture } from "./utils.js";

/**
 * Board class - Handles 3D board creation and management
 */
export class Board {
  constructor(scene) {
    this.scene = scene;
    this.boardGroup = null;
  }

  /**
   * Create the complete board with platform, borders, and cells
   */
  create() {
    this.boardGroup = new THREE.Group();

    this.createPlatform();
    this.createBorders();
    this.createCells();

    this.scene.add(this.boardGroup);
    return this.boardGroup;
  }

  /**
   * Create the base platform with wood texture
   */
  createPlatform() {
    const platformGeometry = new THREE.BoxGeometry(
      BOARD_CONFIG.SIZE * BOARD_CONFIG.CELL_SIZE + 0.8,
      0.4,
      BOARD_CONFIG.SIZE * BOARD_CONFIG.CELL_SIZE + 0.8
    );

    const woodCanvas = createWoodTexture();
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(4, 4);

    const platformMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      ...MATERIALS.BOARD_PLATFORM,
    });

    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.25;
    platform.receiveShadow = true;
    platform.castShadow = true;
    this.boardGroup.add(platform);
  }

  /**
   * Create decorative borders around the board
   */
  createBorders() {
    const borderHeight = 0.15;
    const borderWidth = 0.15;
    const borderMaterial = new THREE.MeshStandardMaterial(
      MATERIALS.BOARD_BORDER
    );

    // Top border
    const topBorder = new THREE.Mesh(
      new THREE.BoxGeometry(
        BOARD_CONFIG.SIZE * BOARD_CONFIG.CELL_SIZE + 1,
        borderHeight,
        borderWidth
      ),
      borderMaterial
    );
    topBorder.position.set(
      0,
      0,
      -(BOARD_CONFIG.SIZE * BOARD_CONFIG.CELL_SIZE + borderWidth) / 2
    );
    topBorder.castShadow = true;
    this.boardGroup.add(topBorder);

    // Bottom border
    const bottomBorder = topBorder.clone();
    bottomBorder.position.z =
      (BOARD_CONFIG.SIZE * BOARD_CONFIG.CELL_SIZE + borderWidth) / 2;
    this.boardGroup.add(bottomBorder);

    // Left border
    const leftBorder = new THREE.Mesh(
      new THREE.BoxGeometry(
        borderWidth,
        borderHeight,
        BOARD_CONFIG.SIZE * BOARD_CONFIG.CELL_SIZE + 1
      ),
      borderMaterial
    );
    leftBorder.position.set(
      -(BOARD_CONFIG.SIZE * BOARD_CONFIG.CELL_SIZE + borderWidth) / 2,
      0,
      0
    );
    leftBorder.castShadow = true;
    this.boardGroup.add(leftBorder);

    // Right border
    const rightBorder = leftBorder.clone();
    rightBorder.position.x =
      (BOARD_CONFIG.SIZE * BOARD_CONFIG.CELL_SIZE + borderWidth) / 2;
    this.boardGroup.add(rightBorder);
  }

  /**
   * Create all board cells with numbers
   */
  createCells() {
    let cellNumber = 100;

    for (let row = 0; row < BOARD_CONFIG.SIZE; row++) {
      for (let col = 0; col < BOARD_CONFIG.SIZE; col++) {
        const actualCol = row % 2 === 0 ? BOARD_CONFIG.SIZE - 1 - col : col;

        this.createCell(row, actualCol, cellNumber);
        cellNumber--;
      }
    }
  }

  /**
   * Create a single cell with number
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @param {number} cellNumber - Cell number (1-100)
   */
  createCell(row, col, cellNumber) {
    const cellGeometry = new THREE.BoxGeometry(
      BOARD_CONFIG.CELL_SIZE - 0.08,
      0.12,
      BOARD_CONFIG.CELL_SIZE - 0.08
    );

    // Egyptian colorful board pattern
    const colorPattern = (row + col) % 6;
    let cellColor;
    if (colorPattern === 0) {
      cellColor = CELL_COLORS.GOLD;
    } else if (colorPattern === 1) {
      cellColor = CELL_COLORS.TERRACOTTA;
    } else if (colorPattern === 2) {
      cellColor = CELL_COLORS.TURQUOISE;
    } else if (colorPattern === 3) {
      cellColor = CELL_COLORS.BURGUNDY;
    } else if (colorPattern === 4) {
      cellColor = CELL_COLORS.GREEN;
    } else {
      cellColor = CELL_COLORS.BLUE;
    }

    const cellMaterial = new THREE.MeshStandardMaterial({
      color: cellColor,
      ...MATERIALS.CELL_GLASS,
    });

    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
    cell.position.set(
      col * BOARD_CONFIG.CELL_SIZE -
        BOARD_CONFIG.OFFSET +
        BOARD_CONFIG.CELL_SIZE / 2,
      0.01,
      row * BOARD_CONFIG.CELL_SIZE -
        BOARD_CONFIG.OFFSET +
        BOARD_CONFIG.CELL_SIZE / 2
    );
    cell.receiveShadow = true;
    cell.castShadow = true;
    this.boardGroup.add(cell);

    // Add cell number text
    this.createCellNumber(col, row, cellNumber);
  }

  /**
   * Create number text for a cell (Egyptian style)
   * @param {number} col - Column index
   * @param {number} row - Row index
   * @param {number} cellNumber - Cell number
   */
  createCellNumber(col, row, cellNumber) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    // Egyptian style text with gold outline
    context.shadowColor = "rgba(0,0,0,0.5)";
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    // Draw golden outline for Egyptian hieroglyphic style
    context.strokeStyle = "#d4a648";
    context.lineWidth = 4;
    context.font = "bold 75px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.strokeText(cellNumber.toString(), 64, 64);

    // Fill with white
    context.fillStyle = "#ffffff";
    context.shadowColor = "transparent";
    context.fillText(cellNumber.toString(), 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const textGeometry = new THREE.PlaneGeometry(0.65, 0.65);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(
      col * BOARD_CONFIG.CELL_SIZE -
        BOARD_CONFIG.OFFSET +
        BOARD_CONFIG.CELL_SIZE / 2,
      0.075,
      row * BOARD_CONFIG.CELL_SIZE -
        BOARD_CONFIG.OFFSET +
        BOARD_CONFIG.CELL_SIZE / 2
    );
    textMesh.rotation.x = -Math.PI / 2;
    this.boardGroup.add(textMesh);
  }

  /**
   * Remove the board from the scene
   */
  destroy() {
    if (this.boardGroup) {
      this.scene.remove(this.boardGroup);
      this.boardGroup = null;
    }
  }
}
