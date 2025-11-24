# Sound Files for Snake & Ladder Game

This directory should contain the audio files for the game. The game currently references the following sound files:

## Required Sound Files

### 1. Background Music

- **Files**: `background-music.mp3`, `background-music.ogg`
- **Purpose**: Looping background music during gameplay
- **Suggested**: Calm, Egyptian-themed ambient music (2-3 minutes loop)
- **Volume**: Set to 30% by default

### 2. Click Sound

- **Files**: `click.mp3`, `click.ogg`
- **Purpose**: Button click feedback
- **Suggested**: Short, crisp click sound (0.1-0.2 seconds)
- **Volume**: Set to 50% by default

### 3. Dice Roll Sound

- **Files**: `dice-roll.mp3`, `dice-roll.ogg`
- **Purpose**: Played when the dice is rolled
- **Suggested**: Dice rolling/shaking sound (0.5-1 second)
- **Volume**: Set to 50% by default

### 4. Move Sound

- **Files**: `move.mp3`, `move.ogg`
- **Purpose**: Played when player piece moves
- **Suggested**: Light "whoosh" or movement sound (0.2-0.3 seconds)
- **Volume**: Set to 35% by default (quieter than other effects)

### 5. Ladder Sound

- **Files**: `ladder.mp3`, `ladder.ogg`
- **Purpose**: Played when player climbs a ladder
- **Suggested**: Climbing, ascending, or positive achievement sound (1-2 seconds)
- **Volume**: Set to 50% by default

### 6. Snake Sound

- **Files**: `snake.mp3`, `snake.ogg`
- **Purpose**: Played when player hits a snake
- **Suggested**: Snake hiss, sliding down, or negative/failure sound (1-2 seconds)
- **Volume**: Set to 50% by default

### 7. Win Sound

- **Files**: `win.mp3`, `win.ogg`
- **Purpose**: Played when a player wins
- **Suggested**: Celebratory fanfare or victory sound (2-3 seconds)
- **Volume**: Set to 50% by default

## Audio Format Notes

- MP3 and OGG formats are provided for browser compatibility
- OGG format is optional but recommended for better browser support
- Keep file sizes small for faster loading (compress if necessary)
- Recommended sample rate: 44.1kHz or 48kHz
- Recommended bitrate: 128kbps for music, 64-96kbps for effects

## Where to Find Sounds

You can find free sound effects from:

- [Freesound.org](https://freesound.org/)
- [OpenGameArt.org](https://opengameart.org/)
- [Zapsplat.com](https://www.zapsplat.com/)
- [Mixkit.co](https://mixkit.co/free-sound-effects/)

## Implementation Details

The game will continue to work without these files, but no sound will play. The AudioManager catches errors gracefully if files are missing.

To disable sound entirely, users can click the 🔊 button in-game to toggle sound on/off.
