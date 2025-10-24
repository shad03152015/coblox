import * as THREE from 'three';

export class MultiplayerManager {
  constructor(scene) {
    this.scene = scene;
    this.otherPlayers = new Map(); // Map of playerId -> player object
  }

  // Create a visual representation for another player
  createPlayerAvatar(playerData) {
    const playerGroup = new THREE.Group();

    // Create player body (simple capsule-like shape)
    const bodyGeometry = new THREE.CapsuleGeometry(0.35, 1.2, 4, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: this.getRandomPlayerColor()
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    playerGroup.add(body);

    // Create player head
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({
      color: 0xffdbac // Skin tone
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    playerGroup.add(head);

    // Create name label (sprite with text)
    const nameLabel = this.createNameLabel(playerData.username);
    nameLabel.position.y = 2.2;
    playerGroup.add(nameLabel);

    // Set initial position
    playerGroup.position.set(
      playerData.position.x,
      playerData.position.y,
      playerData.position.z
    );

    // Store player data
    const playerObject = {
      id: playerData.id,
      username: playerData.username,
      group: playerGroup,
      targetPosition: new THREE.Vector3(
        playerData.position.x,
        playerData.position.y,
        playerData.position.z
      ),
      targetRotation: playerData.rotation.y || 0
    };

    this.otherPlayers.set(playerData.id, playerObject);
    this.scene.add(playerGroup);

    console.log(`👤 Player avatar created: ${playerData.username}`);
    return playerObject;
  }

  // Create a text sprite for player name
  createNameLabel(username) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    // Draw background
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.roundRect(0, 0, canvas.width, canvas.height, 10);
    context.fill();

    // Draw text
    context.font = 'Bold 32px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(username, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 0.5, 1);

    return sprite;
  }

  // Generate random color for player body
  getRandomPlayerColor() {
    const colors = [
      0x00d9ff, // Cyan
      0xff006e, // Magenta
      0xb537f2, // Purple
      0x00ff88, // Green
      0xffaa00, // Orange
      0xff3366, // Pink
      0x66ccff, // Light blue
      0xffff00  // Yellow
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Update player position (called from socket event)
  updatePlayerPosition(playerId, position, rotation) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      player.targetPosition.set(position.x, position.y, position.z);
      player.targetRotation = rotation.y;
    }
  }

  // Remove player from scene
  removePlayer(playerId) {
    const player = this.otherPlayers.get(playerId);
    if (player) {
      this.scene.remove(player.group);

      // Dispose of geometries and materials
      player.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      this.otherPlayers.delete(playerId);
      console.log(`👋 Player avatar removed: ${player.username}`);
    }
  }

  // Smooth interpolation of player positions (call in animation loop)
  update(deltaTime) {
    this.otherPlayers.forEach((player) => {
      // Smooth position interpolation
      player.group.position.lerp(player.targetPosition, 0.2);

      // Smooth rotation interpolation
      const currentRotation = player.group.rotation.y;
      const rotationDiff = player.targetRotation - currentRotation;

      // Handle rotation wrapping around 2*PI
      let normalizedDiff = rotationDiff;
      if (Math.abs(rotationDiff) > Math.PI) {
        normalizedDiff = rotationDiff > 0
          ? rotationDiff - Math.PI * 2
          : rotationDiff + Math.PI * 2;
      }

      player.group.rotation.y += normalizedDiff * 0.2;
    });
  }

  // Handle existing players when joining a world
  handleExistingPlayers(players) {
    players.forEach(playerData => {
      this.createPlayerAvatar(playerData);
    });
  }

  // Clear all players (when leaving world)
  clearAllPlayers() {
    this.otherPlayers.forEach((player, playerId) => {
      this.removePlayer(playerId);
    });
    this.otherPlayers.clear();
  }

  // Get count of other players
  getPlayerCount() {
    return this.otherPlayers.size;
  }
}
