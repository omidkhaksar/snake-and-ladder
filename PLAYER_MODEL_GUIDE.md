# 🎮 Player 3D Model Guide

## Overview

The game now uses the external **player.glb** 3D model for all player pieces! Each player gets a unique color from the Egyptian palette applied to the model.

## Model Location

Place your player model here:
```
/public/models/player.glb
```

✅ **Already in place!** The game will automatically load it.

## Player Colors (Egyptian Theme)

Each player gets one of these colors applied automatically:

1. **Player 1**: Egyptian Gold (#EDBA58) 🟡
2. **Player 2**: Terracotta (#CF7541) 🟠
3. **Player 3**: Royal Burgundy (#9E2449) 🔴
4. **Player 4**: Nile Turquoise (#50A296) 🔵
5. **Player 5**: Papyrus Green (#629E44) 🟢
6. **Player 6**: Lapis Lazuli (#4C8CE6) 💙
7. **Player 7**: Desert Sand (#D4A648) 🟨

## Adjusting Model Settings

Edit `src/constants.js` to customize the player model appearance:

```javascript
PLAYER: {
  targetSize: 0.5,        // Target height of player model (units)
  heightOffset: 0.18,     // Base height position on board
  rotationOffset: 0,      // Rotation in radians (0 = no rotation)
}
```

### Common Adjustments

#### Model Too Large?
```javascript
targetSize: 0.3,  // Make smaller
```

#### Model Too Small?
```javascript
targetSize: 0.7,  // Make larger
```

#### Model Floating Above Board?
```javascript
heightOffset: 0.1,  // Lower it
```

#### Model Sinking Into Board?
```javascript
heightOffset: 0.25,  // Raise it
```

#### Model Facing Wrong Direction?
```javascript
rotationOffset: Math.PI,      // Rotate 180°
rotationOffset: Math.PI / 2,  // Rotate 90°
rotationOffset: -Math.PI / 2, // Rotate -90°
```

## How It Works

1. **Model Loading**: The game loads `player.glb` once and caches it
2. **Cloning**: Each player gets their own copy of the model
3. **Coloring**: The model is automatically colored with the player's Egyptian color
4. **Positioning**: Players are spread out on each cell to avoid overlap
5. **Animation**: Players bounce when moving between cells

## Features

✨ **Automatic Coloring**: Each player's model is colored automatically
🎨 **Material Properties**: Metalness, roughness, and emissive colors applied
🎬 **Animation Support**: Models animate smoothly when moving
💾 **Model Caching**: Loads once, reused for all players
🔄 **Fallback Support**: If model fails to load, uses procedural pieces

## Fallback Mode

If the player.glb model cannot be loaded, the game automatically falls back to procedural player pieces:
- Cylinder base
- Cone body
- Sphere on top

To force using procedural pieces instead of the model, edit `src/Player.js`:
```javascript
this.useExternalModel = false; // Change to false
```

## Model Requirements

For best results, your player.glb model should:

- ✅ Be properly scaled (will auto-scale but better if pre-scaled)
- ✅ Be centered at origin (0, 0, 0)
- ✅ Face forward (positive Z direction)
- ✅ Have materials that accept color (not textured)
- ✅ Be optimized (low poly count recommended)

## Supported Formats

- **GLB** (recommended) - Binary GLTF
- **GLTF** - JSON GLTF with separate bin files

## Testing Your Changes

1. **Edit** `src/constants.js`
2. **Save** the file
3. **Refresh** browser (Ctrl+R / Cmd+R)
4. **Check** player appearance on the board
5. **Adjust** values as needed
6. **Repeat** until satisfied

## Troubleshooting

### Model Not Loading
- Check console (F12) for error messages
- Verify file is at `/public/models/player.glb`
- Try different path formats in `Player.js`
- Check model is valid GLB/GLTF format

### Model Too Dark
- Check lighting in `main.js`
- Increase emissiveIntensity in `Player.js`
- Adjust material properties

### Model Wrong Size
```javascript
targetSize: 0.5,  // Adjust this value
```

### Model Wrong Height
```javascript
heightOffset: 0.18,  // Adjust this value
```

### Model Wrong Orientation
```javascript
rotationOffset: Math.PI,  // Try different rotations
```

### Players Overlapping
The game spreads players automatically. If they still overlap, the model might be too large:
```javascript
targetSize: 0.4,  // Make smaller
```

## Example Configurations

### Small Player Models
```javascript
PLAYER: {
  targetSize: 0.3,
  heightOffset: 0.15,
  rotationOffset: 0,
}
```

### Large Player Models
```javascript
PLAYER: {
  targetSize: 0.7,
  heightOffset: 0.25,
  rotationOffset: 0,
}
```

### Rotated Player Models
```javascript
PLAYER: {
  targetSize: 0.5,
  heightOffset: 0.18,
  rotationOffset: Math.PI / 2,  // 90° rotation
}
```

## Performance Tips

- Use low-poly models for better performance
- Keep model file size under 5MB
- Use GLB format (faster than GLTF)
- Optimize textures if model has any

## Console Messages

When the game loads, check the console for:

✅ Success:
```
✅ Player model loaded from: /models/player.glb
```

❌ Fallback (model not found):
```
⚠️ Failed to load player model for Player 1, using procedural: ...
```

## Advanced: Custom Player Models

Want different models for each player? Edit `src/Player.js`:

1. Add player-specific model paths
2. Load different models per player number
3. Adjust scales individually

Example concept:
```javascript
const modelPath = `/models/player${this.playerNumber}.glb`;
```

This would load:
- player1.glb, player2.glb, player3.glb, etc.

## Cache Management

To clear the model cache (useful during development):

```javascript
Player.clearCache();
```

Or disable model caching entirely in `src/Player.js`.

---

**Quick Start:** The default settings should work well! If the player model looks wrong, just adjust `targetSize` in `constants.js`! 🎮

