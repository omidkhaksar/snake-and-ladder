import { BOARD_CONFIG } from './constants.js';

/**
 * Convert cell number to 3D position
 * @param {number} cellNumber - Cell number (1-100)
 * @returns {{x: number, z: number}} Position object
 */
export function getPositionFromCell(cellNumber) {
  cellNumber = Math.max(1, Math.min(100, cellNumber));
  const index = 100 - cellNumber;
  const row = Math.floor(index / BOARD_CONFIG.SIZE);
  const col = index % BOARD_CONFIG.SIZE;
  const actualCol = row % 2 === 0 ? BOARD_CONFIG.SIZE - 1 - col : col;

  return {
    x: actualCol * BOARD_CONFIG.CELL_SIZE - BOARD_CONFIG.OFFSET + BOARD_CONFIG.CELL_SIZE / 2,
    z: row * BOARD_CONFIG.CELL_SIZE - BOARD_CONFIG.OFFSET + BOARD_CONFIG.CELL_SIZE / 2
  };
}

/**
 * Create a promise-based delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create wood texture canvas
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {HTMLCanvasElement} Canvas with wood texture
 */
export function createWoodTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Wood base color
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#3d2817');
  gradient.addColorStop(0.5, '#4a3219');
  gradient.addColorStop(1, '#3d2817');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Wood grain
  for (let i = 0; i < 50; i++) {
    ctx.strokeStyle = `rgba(30, 20, 10, ${0.1 + Math.random() * 0.2})`;
    ctx.lineWidth = Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * height);
    ctx.lineTo(width, Math.random() * height);
    ctx.stroke();
  }

  return canvas;
}

/**
 * Create ladder wood texture
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {HTMLCanvasElement} Canvas with ladder wood texture
 */
export function createLadderWoodTexture(width = 256, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base wood color
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#a0522d');
  gradient.addColorStop(0.3, '#b8651f');
  gradient.addColorStop(0.6, '#cd853f');
  gradient.addColorStop(1, '#a0522d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Wood grain lines
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = `rgba(80, 50, 20, ${0.15 + Math.random() * 0.25})`;
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * height);
    ctx.bezierCurveTo(
      width * 0.25, Math.random() * height,
      width * 0.5, Math.random() * height,
      width * 0.75, Math.random() * height
    );
    ctx.lineTo(width, Math.random() * height);
    ctx.stroke();
  }

  // Wood knots
  for (let i = 0; i < 8; i++) {
    const knotX = Math.random() * width;
    const knotY = Math.random() * height;
    const knotSize = Math.random() * 10 + 5;
    
    ctx.fillStyle = `rgba(70, 40, 15, ${0.3 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(knotX, knotY, knotSize, knotSize * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

/**
 * Create snake skin texture
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {HTMLCanvasElement} Canvas with snake skin texture
 */
export function createSnakeSkinTexture(width = 512, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base color - natural snake colors
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#c9a882');
  gradient.addColorStop(0.3, '#d4b896');
  gradient.addColorStop(0.6, '#b89968');
  gradient.addColorStop(1, '#c9a882');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add darker brown patterns
  ctx.fillStyle = '#8b6f47';
  for (let y = 0; y < height; y += 35) {
    for (let x = 0; x < width; x += 40) {
      const offset = (Math.floor(y / 35) % 2) * 20;
      ctx.beginPath();
      ctx.ellipse(x + offset, y, 15 + Math.random() * 5, 12 + Math.random() * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add darker spots/scales
  ctx.fillStyle = '#6b5638';
  for (let y = 0; y < height; y += 20) {
    for (let x = 0; x < width; x += 20) {
      const offset = (Math.floor(y / 20) % 2) * 10;
      ctx.beginPath();
      ctx.arc(x + offset, y, 4 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add lighter highlights
  ctx.fillStyle = 'rgba(230, 220, 200, 0.5)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

/**
 * Show a temporary message
 * @param {string} text - Message text
 * @param {number} duration - Duration in ms
 */
export function showMessage(text, duration = 2000) {
  const messageDisplay = document.getElementById('message-display');
  if (messageDisplay) {
    messageDisplay.textContent = text;
    messageDisplay.classList.add('show');
    setTimeout(() => {
      messageDisplay.classList.remove('show');
    }, duration);
  }
}

