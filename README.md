# 🎲 3D Snake & Ladder Game

A stunning 3D implementation of the classic Snake and Ladder board game built with Three.js and modern web technologies.

![Game Preview](https://img.shields.io/badge/Game-Snake%20%26%20Ladder-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.159.0-green)
![Vite](https://img.shields.io/badge/Vite-5.0.0-purple)

## ✨ Features

### 🎮 Game Features
- **2-Player Gameplay**: Take turns rolling the dice and racing to square 100
- **Classic Rules**: Climb ladders to advance, slide down snakes
- **Win Condition**: First player to reach exactly square 100 wins

### 🎨 Visual Features
- **Full 3D Environment**: Beautiful Three.js rendered board game
- **Realistic Shadows**: Dynamic shadow mapping for depth
- **Smooth Animations**: 
  - Dice rolling with rotation effects
  - Player movement with jump animations
  - Snake and ladder transitions
- **3D Models**:
  - Animated player pieces (cone-shaped with emissive glow)
  - Curved snake bodies with distinct heads
  - Realistic ladder constructions
  - Numbered board cells (100 squares)

### 🖥️ UI Features
- **Advanced Material Design UI**:
  - Glassmorphism effects with backdrop blur
  - Gradient color schemes
  - Responsive animations and transitions
- **Real-time Statistics**:
  - Current position for each player
  - Move counter
  - Snakes encountered
  - Ladders climbed
- **Interactive Controls**:
  - Camera angle switching
  - Game restart
  - Information modal
- **Visual Feedback**:
  - Active player highlighting
  - Message notifications
  - Winner celebration modal

### 🎥 Camera Controls
- **Orbit Controls**: 
  - Left-click + Drag: Rotate view
  - Right-click + Drag: Pan camera
  - Scroll Wheel: Zoom in/out
- **Toggle View**: Switch between multiple camera angles

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**:
```bash
cd snake-ladder
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
   - Navigate to the URL shown in terminal (usually `http://localhost:5173`)
   - The game should load automatically

### Production Build

To create a production-ready build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## 🎯 How to Play

1. **Starting the Game**:
   - Player 1 (purple cone) starts first
   - Both players begin at square 1

2. **Taking Turns**:
   - Click the "🎲 Roll Dice" button
   - Your player piece will automatically move based on the dice roll
   - Watch for snakes and ladders!

3. **Snakes** 🐍:
   - Landing on a snake's head sends you down to its tail
   - 10 snakes are placed throughout the board

4. **Ladders** 🪜:
   - Landing on a ladder's bottom lets you climb to the top
   - 10 ladders help you advance faster

5. **Winning** 🏆:
   - First player to land exactly on square 100 wins
   - If your roll would exceed 100, you stay in place

## 🎨 Game Configuration

### Board Layout
- **Board Size**: 10x10 grid (100 squares)
- **Numbering**: Bottom-left (1) to top-right (100)
- **Snake-pattern**: Alternating left-to-right and right-to-left

### Snakes Configuration
```javascript
98 → 78, 95 → 75, 93 → 73, 87 → 24, 64 → 60
62 → 19, 56 → 53, 49 → 11, 47 → 26, 16 → 6
```

### Ladders Configuration
```javascript
2 → 38, 7 → 14, 8 → 31, 15 → 26, 21 → 42
28 → 84, 36 → 44, 51 → 67, 71 → 91, 78 → 98
```

## 🛠️ Technical Details

### Technologies Used
- **Three.js**: 3D graphics rendering
- **Vite**: Fast development and building
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Advanced styling with modern features

### Project Structure
```
snake-ladder/
├── index.html          # Main HTML file
├── main.js            # Game logic and Three.js implementation
├── style.css          # Advanced UI styling
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

### Key Components

1. **Game3D Class**: Manages the Three.js scene, rendering, and 3D objects
2. **GameState Class**: Tracks game state, player positions, and turn management
3. **UI Functions**: Handle user interface updates and interactions
4. **Animation System**: Smooth transitions for all game movements

### Performance Optimizations
- Shadow mapping with PCF soft shadows
- Efficient geometry reuse
- Optimized animation loops
- Responsive design for various screen sizes

## 🎨 Customization

### Changing Colors
Player colors can be modified in `main.js`:
```javascript
// Player 1 color (line ~193)
const player1Material = new THREE.MeshStandardMaterial({
    color: 0x667eea,  // Change this hex value
    ...
});

// Player 2 color (line ~205)
const player2Material = new THREE.MeshStandardMaterial({
    color: 0xf5576c,  // Change this hex value
    ...
});
```

### Modifying Board Size
Change the `BOARD_SIZE` constant at the top of `main.js`:
```javascript
const BOARD_SIZE = 10; // Change to 8 for 8x8, 12 for 12x12, etc.
```
(Note: You'll need to adjust snake/ladder positions accordingly)

### Adding More Snakes/Ladders
Edit the `SNAKES` and `LADDERS` objects in `main.js`:
```javascript
const SNAKES = {
    // start: end
    98: 78,
    // Add more...
};

const LADDERS = {
    // start: end
    2: 38,
    // Add more...
};
```

## 📱 Responsive Design

The game automatically adapts to different screen sizes:
- **Desktop**: Full experience with side panels
- **Tablet**: Adjusted layout with smaller panels
- **Mobile**: Optimized touch controls and compact UI

## 🐛 Troubleshooting

### Game not loading
- Ensure all dependencies are installed: `npm install`
- Check that the development server is running: `npm run dev`
- Try clearing your browser cache

### Performance issues
- Reduce shadow quality in `main.js` (shadowMap.mapSize)
- Disable fog effects
- Lower camera far plane distance

### Dice not rolling
- Check that no player is currently moving
- Ensure the game hasn't ended
- Try restarting the game

## 🎓 Learning Resources

This project demonstrates:
- Three.js scene setup and management
- 3D geometry creation and manipulation
- Material and lighting systems
- Animation and tweening
- Camera controls (OrbitControls)
- DOM manipulation and event handling
- Modern CSS techniques (glassmorphism, gradients)
- Game state management

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🌟 Acknowledgments

- Three.js for the amazing 3D library
- Classic Snake & Ladder game design
- Modern UI/UX inspiration from contemporary web design

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the code comments in `main.js`
3. Experiment with the configuration options

---

**Enjoy the game! 🎲🎉**

