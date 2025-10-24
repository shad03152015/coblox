import * as THREE from 'three';

interface PlayerData {
  id: string;
  username: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
}

interface PlayerAvatar {
  mesh: THREE.Group;
  username: string;
  targetPosition: THREE.Vector3;
  targetRotation: THREE.Euler;
  nameplate: THREE.Sprite;
}

/**
 * Manages multiplayer avatars for NeonCity world
 */
export class MultiplayerManager {
  private scene: THREE.Scene;
  private players: Map<string, PlayerAvatar>;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.players = new Map();
  }

  /**
   * Handle existing players when joining the world
   */
  handleExistingPlayers(players: PlayerData[]) {
    console.log(`Loading ${players.length} existing players`);
    players.forEach(player => {
      this.createPlayerAvatar(player);
    });
  }

  /**
   * Create a player avatar in the scene
   */
  createPlayerAvatar(playerData: PlayerData) {
    if (this.players.has(playerData.id)) {
      console.warn(`Player ${playerData.id} already exists`);
      return;
    }

    // Create player group
    const playerGroup = new THREE.Group();

    // Create body (green box for now - can be enhanced later)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: this.getRandomPlayerColor(),
      emissive: 0x00ff00,
      emissiveIntensity: 0.2,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9; // Center the body at player position
    body.castShadow = true;
    playerGroup.add(body);

    // Create head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc99,
      emissive: 0x00ff00,
      emissiveIntensity: 0.1,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.2;
    head.castShadow = true;
    playerGroup.add(head);

    // Create nameplate
    const nameplate = this.createNameplate(playerData.username);
    nameplate.position.set(0, 3, 0);
    playerGroup.add(nameplate);

    // Set initial position
    playerGroup.position.set(
      playerData.position.x,
      playerData.position.y,
      playerData.position.z
    );

    // Add to scene
    this.scene.add(playerGroup);

    // Store player avatar
    this.players.set(playerData.id, {
      mesh: playerGroup,
      username: playerData.username,
      targetPosition: new THREE.Vector3(
        playerData.position.x,
        playerData.position.y,
        playerData.position.z
      ),
      targetRotation: new THREE.Euler(
        playerData.rotation.x,
        playerData.rotation.y,
        0
      ),
      nameplate: nameplate,
    });

    console.log(`Created avatar for player: ${playerData.username} (${playerData.id})`);
  }

  /**
   * Create a nameplate sprite above player
   */
  private createNameplate(username: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = 256;
    canvas.height = 64;

    // Draw background
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = 'Bold 32px Arial';
    context.fillStyle = '#00ff00';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(username, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1);

    return sprite;
  }

  /**
   * Get a random color for player avatar
   */
  private getRandomPlayerColor(): number {
    const colors = [
      0x00ff00, // Green
      0x00ffff, // Cyan
      0xff00ff, // Magenta
      0xffff00, // Yellow
      0xff8800, // Orange
      0x8800ff, // Purple
      0x00ff88, // Teal
      0xff0088, // Pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Update player position (called from server)
   */
  updatePlayerPosition(
    playerId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number }
  ) {
    const player = this.players.get(playerId);
    if (!player) {
      console.warn(`Player ${playerId} not found for position update`);
      return;
    }

    // Update target position for smooth interpolation
    player.targetPosition.set(position.x, position.y, position.z);
    player.targetRotation.set(rotation.x, rotation.y, 0);
  }

  /**
   * Remove player from the scene
   */
  removePlayer(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) {
      console.warn(`Player ${playerId} not found for removal`);
      return;
    }

    // Remove from scene
    this.scene.remove(player.mesh);

    // Dispose geometries and materials
    player.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    // Remove from map
    this.players.delete(playerId);

    console.log(`Removed player: ${playerId}`);
  }

  /**
   * Clear all players (on disconnect)
   */
  clearAllPlayers() {
    this.players.forEach((_, playerId) => {
      this.removePlayer(playerId);
    });
    this.players.clear();
    console.log('Cleared all players');
  }

  /**
   * Update all players (smooth interpolation)
   * Call this in the animation loop
   */
  update(deltaTime: number) {
    const lerpSpeed = 10; // Interpolation speed

    this.players.forEach((player) => {
      // Smoothly interpolate position
      player.mesh.position.lerp(player.targetPosition, deltaTime * lerpSpeed);

      // Smoothly interpolate rotation
      player.mesh.rotation.y = THREE.MathUtils.lerp(
        player.mesh.rotation.y,
        player.targetRotation.y,
        deltaTime * lerpSpeed
      );

      // Make nameplate always face the camera
      if (player.nameplate) {
        // This will be set in the render loop to face the active camera
        // player.nameplate.lookAt(camera.position);
      }
    });
  }

  /**
   * Get number of players currently in the scene
   */
  getPlayerCount(): number {
    return this.players.size;
  }

  /**
   * Update nameplates to face camera
   * Call this in the render loop
   */
  updateNameplates(camera: THREE.Camera) {
    this.players.forEach((player) => {
      if (player.nameplate) {
        player.nameplate.lookAt(camera.position);
      }
    });
  }
}
