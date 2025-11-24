import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Game Configuration
const BOARD_SIZE = 10;
const CELL_SIZE = 1;
const BOARD_OFFSET = (BOARD_SIZE * CELL_SIZE) / 2;

// Snakes and Ladders configuration
const SNAKES = {
  98: 78,
  95: 75,
  93: 73,
  87: 24,
  64: 60,
  62: 19,
  56: 53,
  49: 11,
  47: 26,
  16: 6,
};

const LADDERS = {
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

// Game State
class GameState {
  constructor() {
    this.currentPlayer = 1;
    this.players = {
      1: { position: 1, moves: 0, snakes: 0, ladders: 0 },
      2: { position: 1, moves: 0, snakes: 0, ladders: 0 },
    };
    this.isRolling = false;
    this.isMoving = false;
    this.gameOver = false;
  }

  reset() {
    this.currentPlayer = 1;
    this.players = {
      1: { position: 1, moves: 0, snakes: 0, ladders: 0 },
      2: { position: 1, moves: 0, snakes: 0, ladders: 0 },
    };
    this.isRolling = false;
    this.isMoving = false;
    this.gameOver = false;
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
  }

  updatePosition(player, position) {
    this.players[player].position = position;
    this.players[player].moves++;
  }

  incrementSnake(player) {
    this.players[player].snakes++;
  }

  incrementLadder(player) {
    this.players[player].ladders++;
  }
}

// Three.js Scene Setup
class Game3D {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.controls = null;
    this.board = null;
    this.playerMeshes = {};
    this.snakeMeshes = [];
    this.ladderMeshes = [];
    this.gameState = new GameState();

    this.init();
  }

  init() {
    // Renderer setup
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document
      .getElementById("canvas-container")
      .appendChild(this.renderer.domElement);

    // Camera position
    this.camera.position.set(8, 12, 8);
    this.camera.lookAt(0, 0, 0);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1;

    // Lights - enhanced for glass reflections
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 0.6);
    pointLight1.position.set(-5, 8, -5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.4);
    pointLight2.position.set(5, 6, -5);
    this.scene.add(pointLight2);

    // Background - gradient sky
    this.scene.background = new THREE.Color(0xb8e2f2);
    this.scene.fog = new THREE.Fog(0xb8e2f2, 25, 60);

    // Add ground plane for better depth
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x88cc88,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.6;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Create board
    this.createBoard();
    this.createSnakesAndLadders();
    this.createPlayers();

    // Animation loop
    this.animate();

    // Window resize handler
    window.addEventListener("resize", () => this.onWindowResize());
  }

  createBoard() {
    const boardGroup = new THREE.Group();

    // Base platform with wood texture
    const platformGeometry = new THREE.BoxGeometry(
      BOARD_SIZE * CELL_SIZE + 0.8,
      0.4,
      BOARD_SIZE * CELL_SIZE + 0.8
    );

    // Create wood texture for platform
    const woodCanvas = document.createElement("canvas");
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const woodCtx = woodCanvas.getContext("2d");

    // Wood base color
    const woodGradient = woodCtx.createLinearGradient(0, 0, 512, 0);
    woodGradient.addColorStop(0, "#3d2817");
    woodGradient.addColorStop(0.5, "#4a3219");
    woodGradient.addColorStop(1, "#3d2817");
    woodCtx.fillStyle = woodGradient;
    woodCtx.fillRect(0, 0, 512, 512);

    // Wood grain
    for (let i = 0; i < 50; i++) {
      woodCtx.strokeStyle = `rgba(30, 20, 10, ${0.1 + Math.random() * 0.2})`;
      woodCtx.lineWidth = Math.random() * 3;
      woodCtx.beginPath();
      woodCtx.moveTo(0, Math.random() * 512);
      woodCtx.lineTo(512, Math.random() * 512);
      woodCtx.stroke();
    }

    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(4, 4);

    const platformMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.0,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.25;
    platform.receiveShadow = true;
    platform.castShadow = true;
    boardGroup.add(platform);

    // Decorative border - polished wood
    const borderHeight = 0.15;
    const borderWidth = 0.15;

    const borderMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      roughness: 0.3,
      metalness: 0.4,
      envMapIntensity: 1.0,
    });

    // Top border
    const topBorder = new THREE.Mesh(
      new THREE.BoxGeometry(
        BOARD_SIZE * CELL_SIZE + 1,
        borderHeight,
        borderWidth
      ),
      borderMaterial
    );
    topBorder.position.set(0, 0, -(BOARD_SIZE * CELL_SIZE + borderWidth) / 2);
    topBorder.castShadow = true;
    boardGroup.add(topBorder);

    // Bottom border
    const bottomBorder = topBorder.clone();
    bottomBorder.position.z = (BOARD_SIZE * CELL_SIZE + borderWidth) / 2;
    boardGroup.add(bottomBorder);

    // Left border
    const leftBorder = new THREE.Mesh(
      new THREE.BoxGeometry(
        borderWidth,
        borderHeight,
        BOARD_SIZE * CELL_SIZE + 1
      ),
      borderMaterial
    );
    leftBorder.position.set(-(BOARD_SIZE * CELL_SIZE + borderWidth) / 2, 0, 0);
    leftBorder.castShadow = true;
    boardGroup.add(leftBorder);

    // Right border
    const rightBorder = leftBorder.clone();
    rightBorder.position.x = (BOARD_SIZE * CELL_SIZE + borderWidth) / 2;
    boardGroup.add(rightBorder);

    // Create cells
    let cellNumber = 100;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const actualCol = row % 2 === 0 ? BOARD_SIZE - 1 - col : col;

        const cellGeometry = new THREE.BoxGeometry(
          CELL_SIZE - 0.08,
          0.12,
          CELL_SIZE - 0.08
        );

        // Colorful board pattern like the reference
        const colorPattern = (row + actualCol) % 3;
        let cellColor;
        if (colorPattern === 0) {
          cellColor = 0x4a7c59; // Green
        } else if (colorPattern === 1) {
          cellColor = 0x8b4757; // Maroon/Red
        } else {
          cellColor = 0x4a5f8b; // Blue
        }

        // Special color for milestone squares
        if (cellNumber % 10 === 0) {
          cellColor = 0x5a7c3f; // Brighter green for milestones
        }

        const cellMaterial = new THREE.MeshStandardMaterial({
          color: cellColor,
          roughness: 0.15,
          metalness: 0.1,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.5,
        });

        const cell = new THREE.Mesh(cellGeometry, cellMaterial);
        cell.position.set(
          actualCol * CELL_SIZE - BOARD_OFFSET + CELL_SIZE / 2,
          0.01,
          row * CELL_SIZE - BOARD_OFFSET + CELL_SIZE / 2
        );
        cell.receiveShadow = true;
        cell.castShadow = true;
        boardGroup.add(cell);

        // Add cell number text with better styling
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext("2d");

        // Add shadow for depth
        context.shadowColor = "rgba(0,0,0,0.4)";
        context.shadowBlur = 3;
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;

        context.fillStyle = "#ffffff"; // White numbers for better visibility
        context.font = "bold 75px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(cellNumber.toString(), 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
        });
        const textGeometry = new THREE.PlaneGeometry(0.65, 0.65);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(
          actualCol * CELL_SIZE - BOARD_OFFSET + CELL_SIZE / 2,
          0.13,
          row * CELL_SIZE - BOARD_OFFSET + CELL_SIZE / 2
        );
        textMesh.rotation.x = -Math.PI / 2;
        boardGroup.add(textMesh);

        cellNumber--;
      }
    }

    this.board = boardGroup;
    this.scene.add(boardGroup);
  }

  createSnakesAndLadders() {
    // Create snakes
    for (const [start, end] of Object.entries(SNAKES)) {
      this.createSnake(parseInt(start), parseInt(end));
    }

    // Create ladders
    for (const [start, end] of Object.entries(LADDERS)) {
      this.createLadder(parseInt(start), parseInt(end));
    }
  }

  getPositionFromCell(cellNumber) {
    cellNumber = Math.max(1, Math.min(100, cellNumber));
    const index = 100 - cellNumber;
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    const actualCol = row % 2 === 0 ? BOARD_SIZE - 1 - col : col;

    return {
      x: actualCol * CELL_SIZE - BOARD_OFFSET + CELL_SIZE / 2,
      z: row * CELL_SIZE - BOARD_OFFSET + CELL_SIZE / 2,
    };
  }

  createSnake(start, end) {
    const startPos = this.getPositionFromCell(start);
    const endPos = this.getPositionFromCell(end);

    const snakeGroup = new THREE.Group();

    // Create more realistic curved path with wave-like motion
    const midPoint1X = (startPos.x * 2 + endPos.x) / 3;
    const midPoint1Z = (startPos.z * 2 + endPos.z) / 3;
    const midPoint2X = (startPos.x + endPos.x * 2) / 3;
    const midPoint2Z = (startPos.z + endPos.z * 2) / 3;

    // Create more natural S-curve for snake body (lying flatter)
    const perpX = -(startPos.z - endPos.z) * 0.25;
    const perpZ = (startPos.x - endPos.x) * 0.25;

    // Snake lies closer to board with more horizontal curve
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startPos.x, 0.22, startPos.z),
      new THREE.Vector3(
        midPoint1X + perpX * 1.5,
        0.28,
        midPoint1Z + perpZ * 1.5
      ),
      new THREE.Vector3(
        midPoint2X - perpX * 1.5,
        0.28,
        midPoint2Z - perpZ * 1.5
      ),
      new THREE.Vector3(endPos.x, 0.22, endPos.z),
    ]);

    // Create snake body with varying thickness (tapering)
    const points = curve.getPoints(50);
    const radiusSegments = 12;

    // Create custom geometry for tapered body
    const bodyGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    const normals = [];

    for (let i = 0; i < points.length; i++) {
      const t = i / (points.length - 1);
      // Taper from middle (thickest) to ends - slightly thicker for better visibility
      const radius = 0.15 * Math.sin(t * Math.PI);

      const point = points[i];
      const tangent =
        i < points.length - 1
          ? new THREE.Vector3().subVectors(points[i + 1], point).normalize()
          : new THREE.Vector3().subVectors(point, points[i - 1]).normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const normal = new THREE.Vector3()
        .crossVectors(right, tangent)
        .normalize();

      for (let j = 0; j < radiusSegments; j++) {
        const angle = (j / radiusSegments) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const x = point.x + (right.x * cos + normal.x * sin) * radius;
        const y = point.y + (right.y * cos + normal.y * sin) * radius;
        const z = point.z + (right.z * cos + normal.z * sin) * radius;

        vertices.push(x, y, z);

        const nx = right.x * cos + normal.x * sin;
        const ny = right.y * cos + normal.y * sin;
        const nz = right.z * cos + normal.z * sin;
        normals.push(nx, ny, nz);

        uvs.push(j / radiusSegments, t);
      }
    }

    // Create indices
    for (let i = 0; i < points.length - 1; i++) {
      for (let j = 0; j < radiusSegments; j++) {
        const a = i * radiusSegments + j;
        const b = i * radiusSegments + ((j + 1) % radiusSegments);
        const c = (i + 1) * radiusSegments + ((j + 1) % radiusSegments);
        const d = (i + 1) * radiusSegments + j;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    bodyGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    bodyGeometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3)
    );
    bodyGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    bodyGeometry.setIndex(indices);

    // Create realistic snake skin texture - beige/tan color
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Base color - natural snake colors (beige/tan/brown)
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, "#c9a882");
    gradient.addColorStop(0.3, "#d4b896");
    gradient.addColorStop(0.6, "#b89968");
    gradient.addColorStop(1, "#c9a882");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add darker brown patterns (like python/boa)
    ctx.fillStyle = "#8b6f47";
    for (let y = 0; y < 512; y += 35) {
      for (let x = 0; x < 512; x += 40) {
        const offset = (Math.floor(y / 35) % 2) * 20;
        // Create irregular patches
        ctx.beginPath();
        ctx.ellipse(
          x + offset,
          y,
          15 + Math.random() * 5,
          12 + Math.random() * 4,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Add darker spots/scales
    ctx.fillStyle = "#6b5638";
    for (let y = 0; y < 512; y += 20) {
      for (let x = 0; x < 512; x += 20) {
        const offset = (Math.floor(y / 20) % 2) * 10;
        ctx.beginPath();
        ctx.arc(x + offset, y, 4 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Add lighter highlights
    ctx.fillStyle = "rgba(230, 220, 200, 0.5)";
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const bodyMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.0,
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    snakeGroup.add(body);

    // Create realistic snake head
    const headGroup = new THREE.Group();

    // Head main part - more triangular/diamond shape with realistic colors
    const headGeometry = new THREE.ConeGeometry(0.15, 0.25, 6);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a882,
      roughness: 0.6,
      metalness: 0.0,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotation.x = Math.PI / 2;
    head.castShadow = true;
    headGroup.add(head);

    // Add dark pattern on head
    const headPatternGeometry = new THREE.ConeGeometry(0.12, 0.26, 6);
    const headPatternMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b6f47,
      roughness: 0.5,
    });
    const headPattern = new THREE.Mesh(
      headPatternGeometry,
      headPatternMaterial
    );
    headPattern.rotation.x = Math.PI / 2;
    headPattern.position.y = 0.01;
    headGroup.add(headPattern);

    // Snake eyes (yellow with black pupils)
    const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xaaaa00,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.3,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.08, 0.04, 0.15);
    leftEye.castShadow = true;
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.08, 0.04, 0.15);
    rightEye.castShadow = true;
    headGroup.add(rightEye);

    // Eye pupils
    const pupilGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.1,
    });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.08, 0.04, 0.17);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.08, 0.04, 0.17);
    headGroup.add(rightPupil);

    // Forked tongue
    const tongueGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 4);
    const tongueMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      roughness: 0.8,
    });
    const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongue.position.set(0, -0.02, 0.22);
    tongue.rotation.x = Math.PI / 4;
    headGroup.add(tongue);

    // Tongue fork left
    const tongueForkLeft = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongueForkLeft.position.set(-0.02, -0.06, 0.28);
    tongueForkLeft.rotation.x = Math.PI / 3;
    tongueForkLeft.rotation.z = -Math.PI / 6;
    tongueForkLeft.scale.y = 0.4;
    headGroup.add(tongueForkLeft);

    // Tongue fork right
    const tongueForkRight = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongueForkRight.position.set(0.02, -0.06, 0.28);
    tongueForkRight.rotation.x = Math.PI / 3;
    tongueForkRight.rotation.z = Math.PI / 6;
    tongueForkRight.scale.y = 0.4;
    headGroup.add(tongueForkRight);

    // Position and orient head at the end
    headGroup.position.set(endPos.x, 0.22, endPos.z);

    // Orient head to look in direction of curve
    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 5];
    const direction = new THREE.Vector3().subVectors(
      lastPoint,
      secondLastPoint
    );
    const angle = Math.atan2(direction.x, direction.z);
    headGroup.rotation.y = angle;

    snakeGroup.add(headGroup);
    this.scene.add(snakeGroup);

    this.snakeMeshes.push({
      group: snakeGroup,
      body,
      head: headGroup,
      start,
      end,
    });
  }

  createLadder(start, end) {
    const startPos = this.getPositionFromCell(start);
    const endPos = this.getPositionFromCell(end);

    const ladderGroup = new THREE.Group();

    // Calculate distance and direction
    const dx = endPos.x - startPos.x;
    const dz = endPos.z - startPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Rung height constant
    const rungHeight = 0.085;

    // Calculate ladder angle in XZ plane
    const angleY = Math.atan2(dx, dz); // Rotation around Y axis

    // Calculate perpendicular direction for rail separation (rotated 90 degrees)
    // Perpendicular to (dx, dz) in XZ plane is (-dz, dx)
    const perpX = -dz / distance;
    const perpZ = dx / distance;
    const railOffset = 0.14; // Distance from center to each rail

    // Midpoint of ladder
    const midX = (startPos.x + endPos.x) / 2;
    const midZ = (startPos.z + endPos.z) / 2;

    // Create wood texture for ladder
    const ladderWoodCanvas = document.createElement("canvas");
    ladderWoodCanvas.width = 256;
    ladderWoodCanvas.height = 256;
    const ladderWoodCtx = ladderWoodCanvas.getContext("2d");

    // Base wood color - lighter brown for ladder
    const ladderWoodGradient = ladderWoodCtx.createLinearGradient(0, 0, 256, 0);
    ladderWoodGradient.addColorStop(0, "#a0522d");
    ladderWoodGradient.addColorStop(0.3, "#b8651f");
    ladderWoodGradient.addColorStop(0.6, "#cd853f");
    ladderWoodGradient.addColorStop(1, "#a0522d");
    ladderWoodCtx.fillStyle = ladderWoodGradient;
    ladderWoodCtx.fillRect(0, 0, 256, 256);

    // Wood grain lines
    for (let i = 0; i < 40; i++) {
      ladderWoodCtx.strokeStyle = `rgba(80, 50, 20, ${
        0.15 + Math.random() * 0.25
      })`;
      ladderWoodCtx.lineWidth = Math.random() * 2 + 0.5;
      ladderWoodCtx.beginPath();
      ladderWoodCtx.moveTo(0, Math.random() * 256);
      ladderWoodCtx.bezierCurveTo(
        64,
        Math.random() * 256,
        128,
        Math.random() * 256,
        192,
        Math.random() * 256
      );
      ladderWoodCtx.lineTo(256, Math.random() * 256);
      ladderWoodCtx.stroke();
    }

    // Wood knots
    for (let i = 0; i < 8; i++) {
      const knotX = Math.random() * 256;
      const knotY = Math.random() * 256;
      const knotSize = Math.random() * 10 + 5;

      ladderWoodCtx.fillStyle = `rgba(70, 40, 15, ${
        0.3 + Math.random() * 0.3
      })`;
      ladderWoodCtx.beginPath();
      ladderWoodCtx.ellipse(
        knotX,
        knotY,
        knotSize,
        knotSize * 0.7,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ladderWoodCtx.fill();
    }

    const ladderWoodTexture = new THREE.CanvasTexture(ladderWoodCanvas);
    ladderWoodTexture.wrapS = THREE.RepeatWrapping;
    ladderWoodTexture.wrapT = THREE.RepeatWrapping;

    // Create rail geometry and material - realistic wood with texture
    const railLength = distance;
    const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, railLength, 12);
    const railMaterial = new THREE.MeshStandardMaterial({
      map: ladderWoodTexture,
      color: 0xd2691e,
      roughness: 0.8,
      metalness: 0.0,
    });

    // Left rail - positioned along left side of rungs
    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(
      midX + perpX * railOffset,
      rungHeight,
      midZ + perpZ * railOffset
    );
    leftRail.rotation.order = "YXZ";
    leftRail.rotation.y = angleY; // Align with ladder direction first
    leftRail.rotation.x = Math.PI / 2; // Then rotate to horizontal
    leftRail.castShadow = true;
    ladderGroup.add(leftRail);

    // Right rail - positioned along right side of rungs
    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(
      midX - perpX * railOffset,
      rungHeight,
      midZ - perpZ * railOffset
    );
    rightRail.rotation.order = "YXZ";
    rightRail.rotation.y = angleY; // Align with ladder direction first
    rightRail.rotation.x = Math.PI / 2; // Then rotate to horizontal
    rightRail.castShadow = true;
    ladderGroup.add(rightRail);

    // Rungs (steps) - connecting the two rails with wood texture
    const numRungs = Math.max(4, Math.floor(distance / 0.28));
    const rungGeometry = new THREE.CylinderGeometry(
      0.035,
      0.035,
      railOffset * 2,
      12
    );
    const rungMaterial = new THREE.MeshStandardMaterial({
      map: ladderWoodTexture,
      color: 0xcd853f,
      roughness: 0.8,
      metalness: 0.0,
    });

    for (let i = 1; i < numRungs; i++) {
      const t = i / numRungs;
      const rung = new THREE.Mesh(rungGeometry, rungMaterial);

      // Position along the ladder centerline
      const rungX = startPos.x + dx * t;
      const rungZ = startPos.z + dz * t;

      rung.position.set(rungX, rungHeight, rungZ);
      rung.rotation.order = "YXZ";
      rung.rotation.y = angleY + Math.PI / 2; // Perpendicular to ladder direction
      rung.rotation.x = Math.PI / 2; // Rotate to horizontal
      rung.castShadow = true;
      ladderGroup.add(rung);
    }

    this.scene.add(ladderGroup);
    this.ladderMeshes.push({ group: ladderGroup, start, end });
  }

  createPlayers() {
    // Player 1 - Improved design with base
    const player1Group = new THREE.Group();

    // Base
    const base1Geometry = new THREE.CylinderGeometry(0.15, 0.18, 0.1, 16);
    const base1Material = new THREE.MeshStandardMaterial({
      color: 0x4a5fd9,
      roughness: 0.3,
      metalness: 0.7,
    });
    const base1 = new THREE.Mesh(base1Geometry, base1Material);
    base1.position.y = 0.05;
    base1.castShadow = true;
    player1Group.add(base1);

    // Main piece
    const player1Geometry = new THREE.ConeGeometry(0.15, 0.5, 16);
    const player1Material = new THREE.MeshStandardMaterial({
      color: 0x667eea,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x445ecc,
      emissiveIntensity: 0.3,
    });
    const player1 = new THREE.Mesh(player1Geometry, player1Material);
    player1.position.y = 0.35;
    player1.castShadow = true;
    player1Group.add(player1);

    // Top sphere
    const top1Geometry = new THREE.SphereGeometry(0.08, 16, 16);
    const top1 = new THREE.Mesh(top1Geometry, player1Material);
    top1.position.y = 0.62;
    top1.castShadow = true;
    player1Group.add(top1);

    const startPos1 = this.getPositionFromCell(1);
    player1Group.position.set(startPos1.x - 0.2, 0.18, startPos1.z);
    this.scene.add(player1Group);
    this.playerMeshes[1] = player1Group;

    // Player 2 - Improved design with base
    const player2Group = new THREE.Group();

    // Base
    const base2Geometry = new THREE.CylinderGeometry(0.15, 0.18, 0.1, 16);
    const base2Material = new THREE.MeshStandardMaterial({
      color: 0xd9394a,
      roughness: 0.3,
      metalness: 0.7,
    });
    const base2 = new THREE.Mesh(base2Geometry, base2Material);
    base2.position.y = 0.05;
    base2.castShadow = true;
    player2Group.add(base2);

    // Main piece
    const player2Geometry = new THREE.ConeGeometry(0.15, 0.5, 16);
    const player2Material = new THREE.MeshStandardMaterial({
      color: 0xf5576c,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0xcc3850,
      emissiveIntensity: 0.3,
    });
    const player2 = new THREE.Mesh(player2Geometry, player2Material);
    player2.position.y = 0.35;
    player2.castShadow = true;
    player2Group.add(player2);

    // Top sphere
    const top2Geometry = new THREE.SphereGeometry(0.08, 16, 16);
    const top2 = new THREE.Mesh(top2Geometry, player2Material);
    top2.position.y = 0.62;
    top2.castShadow = true;
    player2Group.add(top2);

    const startPos2 = this.getPositionFromCell(1);
    player2Group.position.set(startPos2.x + 0.2, 0.18, startPos2.z);
    this.scene.add(player2Group);
    this.playerMeshes[2] = player2Group;
  }

  async movePlayer(player, diceValue) {
    this.gameState.isMoving = true;
    const currentPos = this.gameState.players[player].position;
    let newPos = currentPos + diceValue;

    if (newPos > 100) {
      this.gameState.isMoving = false;
      showMessage("Need exact roll to win!");
      setTimeout(() => {
        this.gameState.switchPlayer();
        updateUI(this.gameState);
      }, 1500);
      return;
    }

    // Animate movement step by step
    for (let i = currentPos + 1; i <= newPos; i++) {
      await this.animatePlayerToCell(player, i);
      await this.delay(200);
    }

    this.gameState.updatePosition(player, newPos);
    updateUI(this.gameState);

    // Check for snake or ladder
    if (SNAKES[newPos]) {
      showMessage(`🐍 Snake! Moving down to ${SNAKES[newPos]}`);
      this.gameState.incrementSnake(player);
      await this.delay(1000);
      await this.animatePlayerToCell(player, SNAKES[newPos]);
      this.gameState.updatePosition(player, SNAKES[newPos]);
      updateUI(this.gameState);
    } else if (LADDERS[newPos]) {
      showMessage(`🪜 Ladder! Climbing up to ${LADDERS[newPos]}`);
      this.gameState.incrementLadder(player);
      await this.delay(1000);
      await this.animatePlayerToCell(player, LADDERS[newPos]);
      this.gameState.updatePosition(player, LADDERS[newPos]);
      updateUI(this.gameState);
    }

    // Check for winner
    if (this.gameState.players[player].position === 100) {
      this.gameState.gameOver = true;
      showWinner(player);
      return;
    }

    await this.delay(500);
    this.gameState.switchPlayer();
    updateUI(this.gameState);
    this.gameState.isMoving = false;
  }

  animatePlayerToCell(player, cell) {
    return new Promise((resolve) => {
      const targetPos = this.getPositionFromCell(cell);
      const playerMesh = this.playerMeshes[player];
      const offset = player === 1 ? -0.2 : 0.2;

      const startPos = {
        x: playerMesh.position.x,
        z: playerMesh.position.z,
      };
      const endPos = {
        x: targetPos.x + offset,
        z: targetPos.z,
      };

      let progress = 0;
      const duration = 200;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);

        playerMesh.position.x = startPos.x + (endPos.x - startPos.x) * progress;
        playerMesh.position.z = startPos.z + (endPos.z - startPos.z) * progress;
        playerMesh.position.y = 0.18 + Math.sin(progress * Math.PI) * 0.25;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();

    // Rotate player pieces slightly
    Object.values(this.playerMeshes).forEach((mesh) => {
      mesh.rotation.y += 0.015;
    });

    // Subtle animation for snake tongues
    const time = Date.now() * 0.001;
    this.snakeMeshes.forEach((snake, index) => {
      if (snake.head) {
        // Slight head bobbing
        snake.head.position.y += Math.sin(time * 2 + index) * 0.002;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  resetGame() {
    // Reset player positions
    const startPos1 = this.getPositionFromCell(1);
    const startPos2 = this.getPositionFromCell(1);

    this.playerMeshes[1].position.set(startPos1.x - 0.2, 0.18, startPos1.z);
    this.playerMeshes[2].position.set(startPos2.x + 0.2, 0.18, startPos2.z);

    // Reset game state
    this.gameState.reset();
    updateUI(this.gameState);
  }

  toggleCameraView() {
    const currentPos = this.camera.position.clone();
    const distance = currentPos.length();

    // Toggle between different camera angles
    if (Math.abs(currentPos.x - 8) < 1) {
      // Switch to side view
      this.camera.position.set(0, 12, 12);
    } else if (Math.abs(currentPos.z - 12) < 1) {
      // Switch to top view
      this.camera.position.set(0, 15, 0);
    } else {
      // Switch back to default
      this.camera.position.set(8, 12, 8);
    }

    this.camera.lookAt(0, 0, 0);
    this.controls.update();
  }
}

// UI Functions
function updateUI(gameState) {
  // Update current player
  document.getElementById(
    "current-player-name"
  ).textContent = `Player ${gameState.currentPlayer}`;

  // Update player cards
  document
    .getElementById("player-1-card")
    .classList.toggle("active", gameState.currentPlayer === 1);
  document
    .getElementById("player-2-card")
    .classList.toggle("active", gameState.currentPlayer === 2);

  // Update player stats
  for (let player = 1; player <= 2; player++) {
    const stats = gameState.players[player];
    document.getElementById(`player-${player}-pos`).textContent =
      stats.position;
    document.getElementById(`player-${player}-moves`).textContent = stats.moves;
    document.getElementById(`player-${player}-snakes`).textContent =
      stats.snakes;
    document.getElementById(`player-${player}-ladders`).textContent =
      stats.ladders;
  }

  // Enable/disable roll button
  const rollButton = document.getElementById("roll-button");
  rollButton.disabled = gameState.isMoving || gameState.gameOver;
}

function showMessage(text) {
  const messageDisplay = document.getElementById("message-display");
  messageDisplay.textContent = text;
  messageDisplay.classList.add("show");
  setTimeout(() => {
    messageDisplay.classList.remove("show");
  }, 2000);
}

function showWinner(player) {
  const modal = document.getElementById("winner-modal");
  const winnerText = document.getElementById("winner-text");
  winnerText.textContent = `Player ${player} Wins! 🎉`;
  modal.classList.add("show");
}

function rollDice() {
  return new Promise((resolve) => {
    const diceDisplay = document.getElementById("dice-display");
    const diceValue = document.querySelector(".dice-value");

    diceDisplay.classList.add("rolling");

    let rolls = 0;
    const rollInterval = setInterval(() => {
      diceValue.textContent = Math.floor(Math.random() * 6) + 1;
      rolls++;

      if (rolls >= 10) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        diceValue.textContent = finalValue;
        diceDisplay.classList.remove("rolling");
        resolve(finalValue);
      }
    }, 100);
  });
}

// Initialize game
let game;

window.addEventListener("DOMContentLoaded", () => {
  game = new Game3D();
  updateUI(game.gameState);

  // Roll dice button
  document.getElementById("roll-button").addEventListener("click", async () => {
    if (
      game.gameState.isRolling ||
      game.gameState.isMoving ||
      game.gameState.gameOver
    ) {
      return;
    }

    game.gameState.isRolling = true;
    document.getElementById("roll-button").disabled = true;

    const diceValue = await rollDice();
    showMessage(`Rolled ${diceValue}!`);

    await game.delay(800);
    await game.movePlayer(game.gameState.currentPlayer, diceValue);

    game.gameState.isRolling = false;
    document.getElementById("roll-button").disabled = game.gameState.gameOver;
  });

  // Restart button
  document.getElementById("restart-btn").addEventListener("click", () => {
    game.resetGame();
    document.querySelector(".dice-value").textContent = "?";
    document.getElementById("winner-modal").classList.remove("show");
  });

  // Toggle camera button
  document.getElementById("toggle-camera-btn").addEventListener("click", () => {
    game.toggleCameraView();
  });

  // Info button
  document.getElementById("toggle-info-btn").addEventListener("click", () => {
    document.getElementById("info-modal").classList.add("show");
  });

  // Close modal buttons
  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("info-modal").classList.remove("show");
  });

  document.getElementById("play-again-btn").addEventListener("click", () => {
    game.resetGame();
    document.querySelector(".dice-value").textContent = "?";
    document.getElementById("winner-modal").classList.remove("show");
  });

  // Click outside modal to close
  window.addEventListener("click", (e) => {
    const infoModal = document.getElementById("info-modal");
    const winnerModal = document.getElementById("winner-modal");

    if (e.target === infoModal) {
      infoModal.classList.remove("show");
    }
  });
});
