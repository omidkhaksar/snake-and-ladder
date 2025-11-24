import * as THREE from 'three';
import { MATERIALS } from './constants.js';
import { getPositionFromCell, createLadderWoodTexture } from './utils.js';

/**
 * Ladder class - Creates 3D ladder models
 */
export class Ladder {
  constructor(scene, start, end) {
    this.scene = scene;
    this.start = start;
    this.end = end;
    this.group = new THREE.Group();
  }

  /**
   * Create the complete ladder (rails + rungs)
   */
  create() {
    const startPos = getPositionFromCell(this.start);
    const endPos = getPositionFromCell(this.end);

    const dx = endPos.x - startPos.x;
    const dz = endPos.z - startPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    const rungHeight = 0.085;
    const angleY = Math.atan2(dx, dz);
    
    const perpX = -dz / distance;
    const perpZ = dx / distance;
    const railOffset = 0.14;

    const midX = (startPos.x + endPos.x) / 2;
    const midZ = (startPos.z + endPos.z) / 2;

    // Create texture once for all parts
    const texture = this.createTexture();

    // Create rails
    this.createRails(midX, midZ, distance, angleY, perpX, perpZ, railOffset, rungHeight, texture);

    // Create rungs
    this.createRungs(startPos, dx, dz, distance, angleY, railOffset, rungHeight, texture);

    this.scene.add(this.group);
    return this.group;
  }

  /**
   * Create ladder texture
   * @returns {THREE.CanvasTexture} Texture
   */
  createTexture() {
    const canvas = createLadderWoodTexture();
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Create ladder rails
   */
  createRails(midX, midZ, distance, angleY, perpX, perpZ, railOffset, rungHeight, texture) {
    const railLength = distance;
    const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, railLength, 12);
    const railMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xd2691e,
      ...MATERIALS.LADDER_WOOD
    });

    // Left rail
    const leftRail = new THREE.Mesh(railGeometry, railMaterial);
    leftRail.position.set(
      midX + perpX * railOffset,
      rungHeight,
      midZ + perpZ * railOffset
    );
    leftRail.rotation.order = 'YXZ';
    leftRail.rotation.y = angleY;
    leftRail.rotation.x = Math.PI / 2;
    leftRail.castShadow = true;
    this.group.add(leftRail);

    // Right rail
    const rightRail = new THREE.Mesh(railGeometry, railMaterial);
    rightRail.position.set(
      midX - perpX * railOffset,
      rungHeight,
      midZ - perpZ * railOffset
    );
    rightRail.rotation.order = 'YXZ';
    rightRail.rotation.y = angleY;
    rightRail.rotation.x = Math.PI / 2;
    rightRail.castShadow = true;
    this.group.add(rightRail);
  }

  /**
   * Create ladder rungs
   */
  createRungs(startPos, dx, dz, distance, angleY, railOffset, rungHeight, texture) {
    const numRungs = Math.max(4, Math.floor(distance / 0.28));
    const rungGeometry = new THREE.CylinderGeometry(0.035, 0.035, railOffset * 2, 12);
    const rungMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xcd853f,
      ...MATERIALS.LADDER_WOOD
    });

    for (let i = 1; i < numRungs; i++) {
      const t = i / numRungs;
      const rung = new THREE.Mesh(rungGeometry, rungMaterial);

      const rungX = startPos.x + dx * t;
      const rungZ = startPos.z + dz * t;

      rung.position.set(rungX, rungHeight, rungZ);
      rung.rotation.order = 'YXZ';
      rung.rotation.y = angleY + Math.PI / 2;
      rung.rotation.x = Math.PI / 2;
      rung.castShadow = true;
      this.group.add(rung);
    }
  }

  /**
   * Remove ladder from scene
   */
  destroy() {
    if (this.group) {
      this.scene.remove(this.group);
    }
  }
}

