import * as THREE from 'three';

/**
 * Player Controller for Neon City Chase Game
 * Handles player character creation, movement, and controls
 */
export class PlayerController {
  private scene: THREE.Scene;
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  private direction: THREE.Vector3;
  private moveSpeed: number = 5;
  private runSpeed: number = 10;
  private currentSpeed: number = 5;

  // Key states
  private keys: { [key: string]: boolean } = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  };

  // Game stats
  public distanceTraveled: number = 0;
  public isAlive: boolean = true;
  private lastPosition: THREE.Vector3;

  constructor(scene: THREE.Scene, startPosition: THREE.Vector3) {
    this.scene = scene;
    this.position = startPosition.clone();
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.lastPosition = startPosition.clone();

    this.mesh = this.createPlayerMesh();
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    this.setupControls();

    console.log('🎮 Player Controller initialized');
  }

  /**
   * Create player character mesh (simple humanoid)
   */
  private createPlayerMesh(): THREE.Group {
    const player = new THREE.Group();

    // Body (1 unit wide, 1.8 units tall - human scale)
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.0, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.3,
      metalness: 0.5,
      roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.0;
    body.castShadow = true;
    player.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    player.add(head);

    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 1.0;
    player.add(glow);

    return player;
  }

  /**
   * Setup keyboard controls
   */
  private setupControls(): void {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
    }
  }

  /**
   * Update player position and state
   */
  update(delta: number, buildings: THREE.Mesh[], camera: THREE.Camera): void {
    if (!this.isAlive) return;

    // Reset direction
    this.direction.set(0, 0, 0);

    // Get camera direction (for relative movement)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    // Calculate movement direction based on keys
    if (this.keys.forward) {
      this.direction.add(cameraDirection);
    }
    if (this.keys.backward) {
      this.direction.sub(cameraDirection);
    }
    if (this.keys.left) {
      this.direction.sub(cameraRight);
    }
    if (this.keys.right) {
      this.direction.add(cameraRight);
    }

    // Normalize direction
    if (this.direction.length() > 0) {
      this.direction.normalize();
    }

    // Set speed based on sprint
    this.currentSpeed = this.keys.sprint ? this.runSpeed : this.moveSpeed;

    // Apply movement
    this.velocity.copy(this.direction).multiplyScalar(this.currentSpeed);

    const newPosition = this.position.clone().add(
      this.velocity.clone().multiplyScalar(delta)
    );

    // Check collision with buildings
    if (!this.checkCollision(newPosition, buildings)) {
      this.position.copy(newPosition);
      this.mesh.position.copy(this.position);

      // Rotate player to face movement direction
      if (this.direction.length() > 0) {
        const angle = Math.atan2(this.direction.x, this.direction.z);
        this.mesh.rotation.y = angle;
      }
    }

    // Update distance traveled
    const distanceThisFrame = this.position.distanceTo(this.lastPosition);
    this.distanceTraveled += distanceThisFrame;
    this.lastPosition.copy(this.position);

    // Keep player on ground
    this.position.y = 0;
    this.mesh.position.y = 0;
  }

  /**
   * Check collision with buildings
   */
  private checkCollision(newPosition: THREE.Vector3, buildings: THREE.Mesh[]): boolean {
    const playerRadius = 0.5;

    for (const building of buildings) {
      const buildingBox = new THREE.Box3().setFromObject(building);
      const playerBox = new THREE.Box3(
        new THREE.Vector3(
          newPosition.x - playerRadius,
          0,
          newPosition.z - playerRadius
        ),
        new THREE.Vector3(
          newPosition.x + playerRadius,
          2,
          newPosition.z + playerRadius
        )
      );

      if (buildingBox.intersectsBox(playerBox)) {
        return true; // Collision detected
      }
    }

    return false;
  }

  /**
   * Get player position
   */
  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get player velocity for physics calculations
   */
  getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  /**
   * Get current movement speed
   */
  getCurrentSpeed(): number {
    return this.currentSpeed;
  }

  /**
   * Set player as caught
   */
  setCaught(): void {
    this.isAlive = false;

    // Visual feedback - turn red
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.color.setHex(0xff0000);
          child.material.emissive.setHex(0xff0000);
        }
      }
    });

    console.log('💀 Player caught!');
  }

  /**
   * Check if player is running
   */
  isRunning(): boolean {
    return this.keys.sprint && this.direction.length() > 0;
  }

  /**
   * Reset for new round
   */
  reset(newPosition: THREE.Vector3): void {
    this.position.copy(newPosition);
    this.lastPosition.copy(newPosition);
    this.mesh.position.copy(newPosition);
    this.velocity.set(0, 0, 0);
    this.direction.set(0, 0, 0);
    this.distanceTraveled = 0;
    this.isAlive = true;
    this.currentSpeed = this.moveSpeed;

    // Reset visual to green
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.color.setHex(0x00ff00);
          child.material.emissive.setHex(0x00ff00);
        } else if (child.material instanceof THREE.MeshBasicMaterial) {
          child.material.color.setHex(0x00ff00);
        }
      }
    });

    console.log('🔄 Player reset for new round');
  }

  /**
   * Cleanup
   */
  dispose(): void {
    window.removeEventListener('keydown', (e) => this.onKeyDown(e));
    window.removeEventListener('keyup', (e) => this.onKeyUp(e));

    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    this.scene.remove(this.mesh);
  }
}
