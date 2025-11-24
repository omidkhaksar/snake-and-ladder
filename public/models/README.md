# 🐍 3D Models Directory

## How to Add Snake Models

1. **Download** a snake model from:
   - Sketchfab: https://sketchfab.com/search?q=snake
   - Poly Pizza: https://poly.pizza/
   - CGTrader: https://www.cgtrader.com/free-3d-models/animals/reptile/snake

2. **Format**: Use GLTF (.glb or .gltf) format

3. **Filename**: Rename to `snake.glb`

4. **Place here**: `/public/models/snake.glb`

5. **Reload**: Refresh the game!

## Model Requirements

- **Format**: GLTF/GLB (recommended)
- **Size**: < 5MB
- **Polygons**: < 10,000 (for performance)
- **Textures**: Included or embedded
- **Scale**: Will be auto-adjusted

## Fallback

If no model is found, the game will use the built-in procedural snakes automatically.

## Example Models to Try

### Cartoon Style:
- "Low poly snake" on Sketchfab
- "Stylized serpent" on Poly Pizza

### Realistic Style:
- "Python realistic" on CGTrader
- "Cobra 3D model" on TurboSquid

### Animated:
- "Animated snake rigged" on Sketchfab
- "Snake with animation" on CGTrader

## Testing

After adding your model:
1. Open browser console (F12)
2. Look for: "✅ Snake model loaded from: /models/snake.glb"
3. If you see errors, check:
   - File exists in correct location
   - File is valid GLTF format
   - File size is reasonable

## Troubleshooting

**Model not showing?**
- Check browser console for errors
- Verify file path is `/public/models/snake.glb`
- Try different model file
- Game will fallback to procedural snakes

**Model too small/large?**
- Models are auto-scaled
- For manual control, edit `positionExternalModel()` in `Snake.js`

**Model wrong orientation?**
- Adjust rotation in `positionExternalModel()` function
- Most models should face +Z axis

## Current Status

Place your `snake.glb` file here and it will automatically load!

