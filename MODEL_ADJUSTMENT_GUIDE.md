# 🔧 3D Snake Model Adjustment Guide

## Quick Fix - Model Too Large/Small

### Option 1: Adjust in Constants (Recommended)

Open `src/constants.js` and modify the `MODEL_SETTINGS.SNAKE` values:

```javascript
SNAKE: {
  scale: 0.15,              // ⬅️ CHANGE THIS (smaller = smaller model)
  heightOffset: 0.15,       // Height above board
  rotationOffset: 0,        // Rotation adjustment (in radians)
  useAutoScale: true,       // Auto-scale based on distance
  maxScale: 0.3,            // Maximum scale limit
  minScale: 0.08,           // Minimum scale limit
  stretchToFit: false       // Stretch model to fit snake path
}
```

### Common Adjustments:

**Model Too Large?**
```javascript
scale: 0.08,      // Reduce this value
maxScale: 0.15,   // Lower the max limit
```

**Model Too Small?**
```javascript
scale: 0.25,      // Increase this value
maxScale: 0.5,    // Raise the max limit
```

**Model Floating/Sinking?**
```javascript
heightOffset: 0.2,    // Higher = floats more
heightOffset: 0.1,    // Lower = closer to board
```

**Model Facing Wrong Direction?**
```javascript
rotationOffset: Math.PI,      // Rotate 180° (CURRENT DEFAULT - flips snake)
rotationOffset: 0,            // No rotation
rotationOffset: Math.PI / 2,  // Rotate 90°
rotationOffset: -Math.PI / 2, // Rotate -90°
```

> **Note:** Currently set to `Math.PI` (180°) to ensure snake heads point correctly!

## Auto-Scaling Features

### Enable Auto-Scaling (Default)
```javascript
useAutoScale: true,     // Automatically scales to fit path
maxScale: 0.3,          // Maximum size
minScale: 0.08,         // Minimum size
```

The model will automatically resize based on the distance between snake start and end positions.

### Disable Auto-Scaling (Fixed Size)
```javascript
useAutoScale: false,    // Use fixed scale value
scale: 0.15,           // This exact scale for all snakes
```

## Advanced Options

### Stretch to Fit Path
Makes the snake stretch to cover the entire path:
```javascript
stretchToFit: true,    // Snake stretches along path
```

**Before (stretchToFit: false):**
- Uniform scale on all axes
- Model maintains proportions
- May not cover full path

**After (stretchToFit: true):**
- Stretches along Z axis
- Covers entire path length
- May look distorted on short paths

## Model-Specific Adjustments

Different snake models may need different settings:

### For Low-Poly Models
```javascript
scale: 0.2,
useAutoScale: true,
maxScale: 0.4,
minScale: 0.1,
```

### For Realistic Models
```javascript
scale: 0.12,
useAutoScale: true,
maxScale: 0.25,
minScale: 0.08,
```

### For Cartoon/Stylized Models
```javascript
scale: 0.18,
useAutoScale: true,
maxScale: 0.35,
minScale: 0.1,
stretchToFit: false,
```

## Testing Your Adjustments

1. **Modify** `src/constants.js`
2. **Save** the file
3. **Refresh** browser (Ctrl+R / Cmd+R)
4. **Check** snake sizes on board
5. **Adjust** values as needed
6. **Repeat** until satisfied

## Common Issues & Solutions

### Issue: Snake is sideways
**Solution:**
```javascript
rotationOffset: Math.PI / 2,  // Try different values
```

### Issue: Snake sinks into board
**Solution:**
```javascript
heightOffset: 0.25,  // Increase this value
```

### Issue: All snakes same size (too large/small)
**Solution:**
```javascript
useAutoScale: false,  // Disable auto-scale
scale: 0.15,          // Set desired size
```

### Issue: Some snakes huge, some tiny
**Solution:**
```javascript
useAutoScale: true,   // Enable auto-scale
maxScale: 0.25,       // Limit maximum
minScale: 0.1,        // Limit minimum
```

### Issue: Snake doesn't follow path curve
**Note:** External models are positioned at the center of the path. They don't curve like procedural snakes. This is normal behavior.

**Options:**
1. Use `stretchToFit: true` to make them longer
2. Use procedural snakes (set `useExternalModel: false` in Snake.js)
3. Use shorter snake models

## Real-Time Adjustment Tips

### Quick Test Cycle:
1. Open browser console (F12)
2. Edit `constants.js`
3. Save
4. Refresh page
5. View changes immediately

### Console Debugging:
Check console for messages like:
```
✅ Snake model loaded from: /models/snake.glb
```

If you see warnings, the model may have issues.

## Performance Considerations

**Smaller models = Better performance**

If you have many snakes and performance is slow:
```javascript
scale: 0.1,           // Smaller models
maxScale: 0.2,        // Lower limits
```

## Recommended Settings by Model Type

### Downloaded from Sketchfab:
```javascript
scale: 0.15,
useAutoScale: true,
maxScale: 0.3,
minScale: 0.08,
heightOffset: 0.15,
rotationOffset: 0,
```

### Downloaded from Poly Pizza:
```javascript
scale: 0.2,
useAutoScale: true,
maxScale: 0.35,
minScale: 0.1,
heightOffset: 0.15,
rotationOffset: Math.PI / 2,  // Often needed
```

### Custom Models:
Start with defaults and adjust incrementally.

## Example Configurations

### Configuration A: Small Snakes
```javascript
SNAKE: {
  scale: 0.1,
  heightOffset: 0.12,
  rotationOffset: 0,
  useAutoScale: true,
  maxScale: 0.2,
  minScale: 0.08,
  stretchToFit: false
}
```

### Configuration B: Large Snakes
```javascript
SNAKE: {
  scale: 0.25,
  heightOffset: 0.2,
  rotationOffset: 0,
  useAutoScale: true,
  maxScale: 0.5,
  minScale: 0.15,
  stretchToFit: true
}
```

### Configuration C: Fixed Size (No Auto-Scale)
```javascript
SNAKE: {
  scale: 0.15,
  heightOffset: 0.15,
  rotationOffset: 0,
  useAutoScale: false,
  maxScale: 0.3,
  minScale: 0.08,
  stretchToFit: false
}
```

## Need Help?

1. Check browser console (F12) for errors
2. Verify model file is valid GLTF/GLB
3. Try different scale values
4. Enable/disable auto-scaling
5. Check model orientation in 3D editor (Blender)

---

**Quick Start:** Just change `scale: 0.15` to a smaller value like `0.08` in `constants.js`!

