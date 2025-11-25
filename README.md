# 🎲 3D Snake & Ladder Game

A stunning 3D implementation of the classic Snake and Ladder board game built with Three.js and modern web technologies. Experience the timeless game with beautiful Egyptian-themed graphics, immersive sound effects, and intelligent gameplay features.

![Three.js](https://img.shields.io/badge/Three.js-0.159.0-green)
![Vite](https://img.shields.io/badge/Vite-5.0.0-purple)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 🌟 Key Highlights

- 🎮 **Single Player vs AI** - Challenge an intelligent computer opponent
- 👥 **Multiplayer Mode** - Play with 2-7 players locally
- 🎵 **Immersive Audio** - Background music and sound effects for every action
- 💾 **Auto-Save System** - Never lose your progress, resume anytime
- 🎨 **Egyptian Theme** - Beautiful gold, turquoise, and burgundy color palette
- 🎭 **3D Models** - Custom GLB models for players and snakes
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile

## ✨ Features

### 🎮 Game Modes

- **vs Computer Mode**: Play against an AI opponent that rolls automatically
- **Multiplayer Mode**: Up to 7 players can play locally on the same device
- **Smart Turn Management**: Players lose their turn if they can't reach exactly cell 100

### 🎨 Visual Excellence

- **Full 3D Environment**: Three.js powered immersive board
- **Egyptian Art Style**: Sandstone textures, hieroglyphic-inspired design
- **Dynamic Shadows**: Realistic shadow mapping with PCF soft shadows
- **Smooth Animations**:
  - Player pieces jump and rotate while moving
  - Dice rolling with 3D rotation effects
  - Smooth camera transitions
  - Snake and ladder movement animations
- **3D Models**:
  - Custom player models (GLB format) with Egyptian colors
  - Animated snake models with realistic curves
  - Wooden ladder constructions with texture
  - Numbered board cells (1-100)
- **Smart Player Positioning**:
  - Players center on cells when alone
  - Automatic spacing when multiple players share a cell
  - Players rotate to face their movement direction

### 🎵 Audio System

- **Background Music**: Looping ambient music during gameplay
- **Sound Effects**:
  - Click sounds for all button interactions
  - Dice roll sound effect
  - Ladder climbing sound (positive/success)
  - Snake slide sound (negative/failure)
  - Victory celebration sound
- **Volume Control**: Toggle sound on/off with single button
- **Persistent Settings**: Sound preferences saved to browser

### 💾 Save System

- **Auto-Save**: Game state saved after every move
- **Resume Anytime**: Continue exactly where you left off
- **Smart Recovery**: Loads saved games on browser refresh
- **Save Management**:
  - Clear on game restart
  - Clear on exit to main menu
  - Clear when someone wins
- **Save Data Includes**:
  - Player positions and stats
  - Current turn
  - Move counts
  - Snake and ladder encounters

### 🎯 Game Features

- **Classic Rules**: Exact roll needed to reach cell 100
- **Turn Skipping**: Invalid moves result in lost turn
- **Statistics Tracking**:
  - Total moves per player
  - Snakes encountered
  - Ladders climbed
  - Current position
- **Player Identification**:
  - Color-coded player pieces
  - Active player highlighting
  - Current player indicator

### 🖥️ Modern UI

- **Glassmorphism Effects**: Backdrop blur and transparency
- **Egyptian Color Palette**:
  - Gold (#edba58)
  - Terracotta (#cf7541)
  - Turquoise (#50a296)
  - Royal Burgundy (#9e2449)
  - Papyrus Green (#629e44)
  - Lapis Lazuli (#4c8ce6)
- **Responsive Design**: Works on all screen sizes
- **Interactive Elements**:
  - Animated buttons with hover effects
  - Real-time game statistics
  - Message notifications
  - Modal dialogs
  - Camera controls
  - Pause menu

### 🎥 Camera System

- **Orbit Controls**:
  - Left-click + Drag: Rotate view
  - Right-click + Drag: Pan camera
  - Scroll Wheel: Zoom in/out (limited range)
- **Multiple Views**: Toggle between different camera angles
- **Smooth Transitions**: Animated camera movements

### ⚙️ Pause Menu

- Resume game
- Help & instructions
- Restart game (with confirmation)
- Exit to main menu (with confirmation)
- ESC key support

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:

```bash
git clone https://github.com/omidkhaksar/snake-and-ladder.git
cd snake-and-ladder
```

2. **Install dependencies**:

```bash
npm install
# or
pnpm install
```

3. **Start the development server**:

```bash
npm run dev
```

4. **Open your browser**:
   - Navigate to `http://localhost:5173`
   - Select game mode and start playing!

### Production Build

```bash
npm run build
npm run preview
```

## 🎯 How to Play

### Starting the Game

1. **Choose Game Mode**:

   - 🤖 **vs Computer**: Play against AI
   - 👥 **Multiplayer**: Select 2-7 players

2. **Click "Start New Game"** or **"Continue Game"** if resuming

### Gameplay

1. **Roll the Dice**: Click "🎲 Roll Dice" button
2. **Watch Your Player Move**: Automatic movement with rotation
3. **Snakes** 🐍: Landing on snake head → slide down to tail
4. **Ladders** 🪜: Landing on ladder bottom → climb to top
5. **Win Condition** 🏆: First to reach exactly cell 100

### Rules

- Players must roll exact number to reach cell 100
- Rolling too high = turn skipped
- Computer opponent rolls automatically after 1 second
- Game auto-saves after each move

## 🏗️ Project Structure

```
snake-ladder/
├── src/
│   ├── main.js          # Main game orchestration
│   ├── Board.js         # 3D board creation
│   ├── Player.js        # Player model and movement
│   ├── Snake.js         # Snake 3D models
│   ├── Ladder.js        # Ladder constructions
│   ├── GameState.js     # Game logic and rules
│   ├── AudioManager.js  # Sound system
│   ├── SaveManager.js   # Save/load functionality
│   ├── constants.js     # Game configuration
│   └── utils.js         # Helper functions
├── public/
│   ├── models/
│   │   ├── player.glb   # Player 3D model
│   │   └── snake.glb    # Snake 3D model
│   └── sounds/
│       ├── background-music.mp3
│       ├── click.ogg
│       ├── dice-roll.mp3
│       ├── ladder.mp3
│       ├── snake.mp3
│       └── win.ogg
├── index.html           # Main HTML
├── style.css           # Advanced styling
├── package.json        # Dependencies
└── README.md          # Documentation
```

## 🛠️ Technical Architecture

### Core Technologies

- **Three.js**: 3D rendering engine
- **Vite**: Lightning-fast development server
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with glassmorphism
- **Web Audio API**: Sound management
- **LocalStorage API**: Game state persistence

### Key Classes

1. **Game3D**: Main game orchestrator

   - Scene management
   - 3D object initialization
   - Animation loop
   - Event handling

2. **GameState**: Game logic controller

   - Turn management
   - Move validation
   - Snake/ladder detection
   - Win condition checking

3. **Player**: Player piece controller

   - 3D model loading
   - Position updates
   - Rotation to face direction
   - Statistics tracking

4. **AudioManager**: Sound system

   - Background music
   - Sound effects
   - Volume control
   - Browser compatibility

5. **SaveManager**: Persistence layer
   - Auto-save functionality
   - Save validation
   - LocalStorage management
   - Resume game feature

### Performance Optimizations

- Efficient geometry reuse
- Cached 3D models (shared between instances)
- Optimized shadow mapping
- RequestAnimationFrame for smooth animations
- Lazy loading of audio files
- Debounced save operations

## 🎨 Customization

### Game Configuration

Edit `src/constants.js` to customize:

```javascript
// Number of players
GAME_SETTINGS.MIN_PLAYERS = 2;
GAME_SETTINGS.MAX_PLAYERS = 7;

// Board size
BOARD_CONFIG.SIZE = 10;

// Snake positions
export const SNAKES = {
  97: 66,
  93: 75,
  // Add more...
};

// Ladder positions
export const LADDERS = {
  2: 38,
  7: 14,
  // Add more...
};

// Player colors (Egyptian palette)
export const PLAYER_COLORS = [
  { main: 0xedba58, name: "Egyptian Gold" },
  // Customize colors...
];
```

### 3D Models

Replace models in `/public/models/`:

- `player.glb`: Player piece model
- `snake.glb`: Snake body model

See `MODEL_ADJUSTMENT_GUIDE.md` for scaling and positioning.

### Audio Files

Replace audio in `/public/sounds/`:

- `background-music.mp3`: Looping background music
- `click.ogg`: Button click sound
- `dice-roll.mp3`: Dice rolling sound
- `ladder.mp3`: Ladder climb sound
- `snake.mp3`: Snake slide sound
- `win.ogg`: Victory sound

## 🐛 Troubleshooting

### Clear Corrupted Save

Visit: `http://localhost:5173/clear-save.html`

Or in browser console:

```javascript
localStorage.clear();
location.reload();
```

### Performance Issues

- Lower shadow quality in `constants.js`
- Reduce `MAX_PLAYERS`
- Disable sound effects

### 3D Models Not Loading

- Check browser console for errors
- Verify model paths in `/public/models/`
- Ensure models are in GLB format

## 📚 Documentation

- `ARCHITECTURE.md` - System architecture overview
- `MODELS_GUIDE.md` - 3D model specifications
- `PLAYER_MODEL_GUIDE.md` - Player model details
- `MODEL_ADJUSTMENT_GUIDE.md` - Scaling and positioning
- `SNAKE_SIZES.md` - Snake model configurations

## 🎓 What This Project Demonstrates

### Three.js Skills

- Scene setup and management
- 3D geometry creation
- Material systems and lighting
- GLB model loading (GLTFLoader)
- Animation systems
- Camera controls (OrbitControls)
- Shadow mapping

### JavaScript Skills

- ES6+ modern syntax
- Class-based architecture
- Async/await patterns
- Promise handling
- Event-driven programming
- LocalStorage API
- Web Audio API

### CSS Skills

- Glassmorphism effects
- CSS Grid and Flexbox
- Animations and transitions
- Responsive design
- Modern UI patterns

### Software Engineering

- Modular architecture
- Separation of concerns
- State management
- Error handling
- Code documentation
- Git version control

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🌟 Credits

- **Three.js** - Incredible 3D library
- **Vite** - Fast build tool
- **GLTFLoader** - Model loading
- **OrbitControls** - Camera system

## 📞 Support

Issues or questions?

- Check the troubleshooting section
- Review code comments
- Open a GitHub issue

---

**Built with ❤️ using Three.js and modern web technologies**

🎮 **Play Now**: [Live Demo](https://github.com/omidkhaksar/snake-and-ladder)

⭐ **Star this repo** if you found it helpful!
