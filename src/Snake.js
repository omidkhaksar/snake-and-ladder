import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MATERIALS, MODEL_SETTINGS } from "./constants.js";
import { createSnakeSkinTexture, getPositionFromCell } from "./utils.js";

// Shared GLTF loader instance
const gltfLoader = new GLTFLoader();

// Cache for loaded model
let snakeModelCache = null;
let isLoadingModel = false;
let loadModelPromise = null;

/**
 * Snake class - Creates 3D snake models
 * Supports both procedural generation and external 3D models
 *
 * Convention: start = HEAD position (where you land), end = TAIL position (where you slide to)
 */
export class Snake {
  constructor(scene, start, end) {
    this.scene = scene;
    this.start = start; // HEAD position (higher number)
    this.end = end; // TAIL position (lower number)
    this.group = new THREE.Group();
    this.useExternalModel = true; // Set to false to use procedural snakes
  }

  /**
   * Create the complete snake (body + head)
   * Tries to load external model first, falls back to procedural
   */
  async create() {
    const startPos = getPositionFromCell(this.start); // HEAD position
    const endPos = getPositionFromCell(this.end); // TAIL position

    if (this.useExternalModel) {
      const loaded = await this.tryLoadExternalModel(startPos, endPos);
      if (loaded) {
        this.scene.add(this.group);
        return this.group;
      }
    }

    // Fallback to procedural snake
    this.createProceduralSnake(startPos, endPos);
    this.scene.add(this.group);
    return this.group;
  }

  /**
   * Try to load external 3D model
   * @returns {Promise<boolean>} True if successful
   */
  async tryLoadExternalModel(startPos, endPos) {
    try {
      // Try to load cached model or load new one
      if (!snakeModelCache && !isLoadingModel) {
        isLoadingModel = true;
        loadModelPromise = this.loadSnakeModel();
      }

      if (loadModelPromise) {
        snakeModelCache = await loadModelPromise;
        isLoadingModel = false;
        loadModelPromise = null;
      }

      if (snakeModelCache) {
        // Clone the model for this instance
        const snakeClone = snakeModelCache.clone();

        // Position and orient the snake
        this.positionExternalModel(snakeClone, startPos, endPos);
        this.group.add(snakeClone);

        return true;
      }
    } catch (error) {
      console.warn(
        "Failed to load external snake model, using procedural:",
        error.message
      );
      snakeModelCache = null;
      isLoadingModel = false;
      loadModelPromise = null;
    }

    return false;
  }

  /**
   * Load snake 3D model from file
   * @returns {Promise<THREE.Object3D>}
   */
  loadSnakeModel() {
    return new Promise((resolve, reject) => {
      // Try multiple possible paths
      const paths = [
        "/models/snake.glb",
        "/models/snake.gltf",
        "./models/snake.glb",
        "../models/snake.glb",
        "/public/models/snake.glb",
      ];

      let currentPath = 0;

      const tryLoad = () => {
        if (currentPath >= paths.length) {
          reject(new Error("No snake model found in any path"));
          return;
        }

        gltfLoader.load(
          paths[currentPath],
          (gltf) => {
            console.log(`✅ Snake model loaded from: ${paths[currentPath]}`);
            resolve(gltf.scene);
          },
          (progress) => {
            // Loading progress
          },
          (error) => {
            currentPath++;
            tryLoad();
          }
        );
      };

      tryLoad();
    });
  }

  /**
   * Position and orient external model
   * @param {THREE.Object3D} model - The model to position
   * @param {Object} startPos - Start position (HEAD - where you land)
   * @param {Object} endPos - End position (TAIL - where you slide to)
   */
  positionExternalModel(model, startPos, endPos) {
    const settings = MODEL_SETTINGS.SNAKE;

    // Calculate model's bounding box to get actual size
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const modelLength = Math.max(size.x, size.y, size.z);

    // Calculate snake path (head points toward tail)
    const dx = endPos.x - startPos.x;
    const dz = endPos.z - startPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    // Calculate midpoint for better positioning
    const midX = (startPos.x + endPos.x) / 2;
    const midZ = (startPos.z + endPos.z) / 2;

    // Determine scale
    let finalScale;
    if (settings.useAutoScale) {
      // Auto-scale based on path length and model size
      const coverage = settings.coveragePercent || 0.8;
      const targetLength = distance * coverage; // Snake covers specified % of path
      finalScale = targetLength / modelLength;

      // Apply limits
      finalScale = Math.max(
        settings.minScale,
        Math.min(settings.maxScale, finalScale)
      );
    } else {
      finalScale = settings.scale;
    }

    // Apply scale (with stretch option)
    if (settings.stretchToFit) {
      // Stretch along the length
      const lengthScale = distance / modelLength;
      model.scale.set(finalScale, finalScale, lengthScale * finalScale);
    } else {
      // Uniform scale
      model.scale.set(finalScale, finalScale, finalScale);
    }

    // Position at center of path for better placement
    model.position.set(midX, settings.heightOffset, midZ);

    // Rotate to align with path direction
    model.rotation.y = angle + settings.rotationOffset;

    // Center the model on its pivot
    this.centerModelPivot(model, box);

    // Enable shadows
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Optionally adjust material
        if (child.material) {
          child.material.roughness = Math.max(
            child.material.roughness || 0,
            0.5
          );
          child.material.needsUpdate = true;
        }
      }
    });

    // Store path info for potential animation
    model.userData.startPos = startPos;
    model.userData.endPos = endPos;
    model.userData.distance = distance;
  }

  /**
   * Center the model's pivot point
   * @param {THREE.Object3D} model - The model
   * @param {THREE.Box3} box - Bounding box
   */
  centerModelPivot(model, box) {
    const center = box.getCenter(new THREE.Vector3());

    // Adjust position to center the model on its pivot
    model.children.forEach((child) => {
      if (child.isMesh) {
        child.position.sub(center);
      }
    });
  }

  /**
   * Create procedural snake (fallback)
   * @param {Object} startPos - Start position (HEAD - where you land)
   * @param {Object} endPos - End position (TAIL - where you slide to)
   */
  createProceduralSnake(startPos, endPos) {
    this.createBody(startPos, endPos);
    this.createHead(startPos, endPos); // Head at start position!
  }

  /**
   * Create snake body with realistic curve
   * @param {Object} startPos - Starting position (HEAD)
   * @param {Object} endPos - Ending position (TAIL)
   */
  createBody(startPos, endPos) {
    const midPoint1X = (startPos.x * 2 + endPos.x) / 3;
    const midPoint1Z = (startPos.z * 2 + endPos.z) / 3;
    const midPoint2X = (startPos.x + endPos.x * 2) / 3;
    const midPoint2Z = (startPos.z + endPos.z * 2) / 3;

    const perpX = -(startPos.z - endPos.z) * 0.25;
    const perpZ = (startPos.x - endPos.x) * 0.25;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(startPos.x, 0.22, startPos.z),
      new THREE.Vector3(
        midPoint1X + perpX * 1.5,
        0.29,
        midPoint1Z + perpZ * 1.5
      ),
      new THREE.Vector3(
        midPoint2X - perpX * 1.5,
        0.29,
        midPoint2Z - perpZ * 1.5
      ),
      new THREE.Vector3(endPos.x, 0.22, endPos.z),
    ]);

    const bodyGeometry = this.createBodyGeometry(curve);
    const texture = this.createTexture();

    const bodyMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      ...MATERIALS.SNAKE_BODY,
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    this.group.add(body);
  }

  /**
   * Create snake body geometry
   * @param {THREE.Curve} curve - Body curve
   * @returns {THREE.BufferGeometry} Body geometry
   */
  createBodyGeometry(curve) {
    const points = curve.getPoints(50);
    const radiusSegments = 12;
    const bodyGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];
    const normals = [];

    for (let i = 0; i < points.length; i++) {
      const t = i / (points.length - 1);
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

    return bodyGeometry;
  }

  /**
   * Create snake skin texture
   * @returns {THREE.CanvasTexture} Texture
   */
  createTexture() {
    const canvas = createSnakeSkinTexture();
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Create snake head with eyes and tongue
   * @param {Object} headPos - Head position (where you land on the snake)
   * @param {Object} tailPos - Tail position (where you slide down to)
   */
  createHead(headPos, tailPos) {
    const headGroup = new THREE.Group();

    // Head main part
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

    // Head pattern
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

    // Eyes
    this.createEyes(headGroup);

    // Tongue
    this.createTongue(headGroup);

    // Position and orient
    headGroup.position.set(headPos.x, 0.22, headPos.z);

    // Calculate direction (head points toward tail)
    const dx = tailPos.x - headPos.x;
    const dz = tailPos.z - headPos.z;
    const angle = Math.atan2(dx, dz);
    headGroup.rotation.y = angle;

    this.group.add(headGroup);
  }

  /**
   * Create snake eyes
   * @param {THREE.Group} headGroup - Head group to add eyes to
   */
  createEyes(headGroup) {
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

    // Pupils
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
  }

  /**
   * Create forked tongue
   * @param {THREE.Group} headGroup - Head group to add tongue to
   */
  createTongue(headGroup) {
    const tongueGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 4);
    const tongueMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      roughness: 0.8,
    });

    const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongue.position.set(0, -0.02, 0.22);
    tongue.rotation.x = Math.PI / 4;
    headGroup.add(tongue);

    const tongueForkLeft = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongueForkLeft.position.set(-0.02, -0.06, 0.28);
    tongueForkLeft.rotation.x = Math.PI / 3;
    tongueForkLeft.rotation.z = -Math.PI / 6;
    tongueForkLeft.scale.y = 0.4;
    headGroup.add(tongueForkLeft);

    const tongueForkRight = new THREE.Mesh(tongueGeometry, tongueMaterial);
    tongueForkRight.position.set(0.02, -0.06, 0.28);
    tongueForkRight.rotation.x = Math.PI / 3;
    tongueForkRight.rotation.z = Math.PI / 6;
    tongueForkRight.scale.y = 0.4;
    headGroup.add(tongueForkRight);
  }

  /**
   * Remove snake from scene
   */
  destroy() {
    if (this.group) {
      this.scene.remove(this.group);
    }
  }

  /**
   * Clear the model cache (useful for switching models)
   */
  static clearCache() {
    snakeModelCache = null;
    isLoadingModel = false;
    loadModelPromise = null;
  }
}
