# 🐍 Snake Size Reference

## Auto-Scaling System

Each snake is **automatically sized** based on the distance between its head and tail positions! The system calculates the path length and scales each snake accordingly.

### Snake Configuration Format:
```javascript
SNAKES = {
  24: 6,  // Snake HEAD at 24, TAIL at 6 (you land on 24, slide down to 6)
}
```

## Snake Sizes (from your game):

### 🔴 LARGEST SNAKES (maxScale: 0.4):
- **87 → 24**: Distance ≈ 6.3 cells - BIGGEST SNAKE! 🐍
- **62 → 19**: Distance ≈ 4.7 cells - Very large
- **98 → 76**: Distance ≈ 2.8 cells - Large
- **49 → 11**: Distance ≈ 4.2 cells - Large

### 🟡 MEDIUM SNAKES:
- **93 → 73**: Distance ≈ 2.2 cells - Medium
- **95 → 75**: Distance ≈ 2.2 cells - Medium
- **47 → 26**: Distance ≈ 2.4 cells - Medium

### 🟢 SMALLER SNAKES (minScale: 0.06):
- **16 → 6**: Distance ≈ 1.4 cells - Small
- **56 → 53**: Distance ≈ 0.3 cells - Very small
- **64 → 60**: Distance ≈ 0.4 cells - Smallest! 🐍

## Current Settings (`src/constants.js`):

```javascript
SNAKE: {
  useAutoScale: true,        // ✅ Each snake sizes automatically
  maxScale: 0.4,              // Limit for longest snakes
  minScale: 0.06,             // Limit for shortest snakes
  coveragePercent: 0.85,      // Snake covers 85% of path
  stretchToFit: false,        // Uniform scaling (not stretched)
}
```

## How to Adjust:

### Make size differences MORE dramatic:
```javascript
maxScale: 0.5,     // Bigger large snakes
minScale: 0.04,    // Smaller small snakes
```

### Make size differences LESS dramatic:
```javascript
maxScale: 0.25,    // Limit large snakes
minScale: 0.1,     // Boost small snakes
```

### Make snakes cover more of their path:
```javascript
coveragePercent: 0.95,  // Snakes cover 95% of path
```

### Make snakes stretch along their path:
```javascript
stretchToFit: true,  // Snakes will stretch to fit path length
```

## Technical Details:

The auto-scaling formula:
```
distance = sqrt((x2-x1)² + (z2-z1)²)
targetLength = distance × coveragePercent
finalScale = clamp(targetLength / modelLength, minScale, maxScale)
```

This ensures:
- Long snakes (like 87→24) get maximum scale
- Short snakes (like 64→60) get minimum scale
- All snakes fit their paths naturally
- No overlapping or floating

