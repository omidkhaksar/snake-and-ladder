// Game Configuration Constants
export const BOARD_CONFIG = {
  SIZE: 10,
  CELL_SIZE: 1,
  get OFFSET() {
    return (this.SIZE * this.CELL_SIZE) / 2;
  },
};

// Snakes configuration
export const SNAKES = {
  97: 66,
  93: 75,
  88: 70,
  74: 48,
  64: 39,
  77: 61,
  56: 47,
  49: 11,
  33: 14,
  24: 6,
};

// Ladders configuration
export const LADDERS = {
  2: 38,
  7: 14,
  8: 31,
  15: 26,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  78: 98,
};

// Player colors - Egyptian Palette
export const PLAYER_COLORS = [
  { main: 0xedba58, base: 0xd4a648, emissive: 0xc99a38, name: "Egyptian Gold" },
  { main: 0xcf7541, base: 0xb86535, emissive: 0xa55729, name: "Terracotta" },
  {
    main: 0x9e2449,
    base: 0x8a1f3d,
    emissive: 0x761a32,
    name: "Royal Burgundy",
  },
  {
    main: 0x50a296,
    base: 0x458e82,
    emissive: 0x3a7a6e,
    name: "Nile Turquoise",
  },
  { main: 0x629e44, base: 0x558a3b, emissive: 0x487632, name: "Papyrus Green" },
  { main: 0x4c8ce6, base: 0x3f76c7, emissive: 0x3260a8, name: "Lapis Lazuli" },
  { main: 0xd4a648, base: 0xc09438, emissive: 0xab8228, name: "Desert Sand" },
];

// Game settings
export const GAME_SETTINGS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 7,
  DICE_ANIMATION_DURATION: 500,
  MOVE_ANIMATION_DURATION: 200,
  PLAYER_START_POSITION: 1,
  WINNING_POSITION: 100,
};

// Camera settings
export const CAMERA_SETTINGS = {
  FOV: 60,
  NEAR: 0.1,
  FAR: 55,
  DEFAULT_POSITION: { x: 8, y: 12, z: 8 },
  SIDE_VIEW: { x: 0, y: 12, z: 12 },
  TOP_VIEW: { x: 0, y: 15, z: 0 },
  MIN_ZOOM_DISTANCE: 1, // Minimum zoom in distance
  MAX_ZOOM_DISTANCE: 25, // Maximum zoom out distance
};

// Material settings - Egyptian Theme
export const MATERIALS = {
  BOARD_PLATFORM: {
    color: 0xd4a574, // Sandstone
    roughness: 0.7,
    metalness: 0.0,
  },
  BOARD_BORDER: {
    color: 0xd4a648, // Egyptian Gold
    roughness: 0.2,
    metalness: 0.6,
  },
  CELL_GLASS: {
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.3,
  },
  SNAKE_BODY: {
    roughness: 0.7,
    metalness: 0.0,
  },
  LADDER_WOOD: {
    color: 0x8b6f47, // Ancient wood
    roughness: 0.8,
    metalness: 0.0,
  },
  PLAYER_PIECE: {
    roughness: 0.25,
    metalness: 0.8,
  },
};

// Cell colors - Egyptian Palette
export const CELL_COLORS = {
  GOLD: 0xedba58, // Egyptian Gold
  TERRACOTTA: 0xcf7541, // Terracotta
  TURQUOISE: 0x50a296, // Nile Turquoise
  BURGUNDY: 0x9e2449, // Royal Burgundy
  GREEN: 0x629e44, // Papyrus Green
  BLUE: 0x4c8ce6, // Lapis Lazuli
};

// 3D Model settings
export const MODEL_SETTINGS = {
  SNAKE: {
    scale: 0.15, // Base scale multiplier (adjust this to resize)
    heightOffset: 0.2, // Height above board
    rotationOffset: Math.PI, // Additional rotation in radians (Math.PI = 180° to flip direction)
    useAutoScale: true, // Auto-scale based on distance (each snake sizes differently!)
    maxScale: 0.7, // Maximum scale limit (longer snakes: 98→76, 87→24)
    minScale: 0.1, // Minimum scale limit (shorter snakes: 16→6, 64→60)
    stretchToFit: false, // Stretch model to fit snake path
    coveragePercent: 0.85, // How much of the path the snake should cover (0.8 = 80%)
  },
  PLAYER: {
    targetSize: 0.8, // Target height of player model in units
    heightOffset: 0.002, // Base height position on board
    rotationOffset: 0, // Additional rotation in radians (0 = no rotation)
  },
};
