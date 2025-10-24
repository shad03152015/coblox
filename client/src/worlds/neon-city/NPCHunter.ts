import * as THREE from 'three';

/**
 * NPC Hunter for Neon City Chase Game
 * AI-controlled enemy that hunts the player using advanced physics-based algorithms
 */
export class NPCHunter {
  private scene: THREE.Scene;
  public mesh: THREE.Group;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private baseSpeed: number = 6; // Increased base speed
  private maxSpeed: number = 15; // Maximum chase speed
  private currentSpeed: number;
  private detectionRange: number = 100; // Increased detection range
  private catchRange: number = 1.5;

  // Physics-based pursuit variables
  private targetPosition: THREE.Vector3 | null = null;
  private predictedPosition: THREE.Vector3 | null = null;
  private leadTime: number = 0;
  private closingRate: number = 0;
  
  // Adaptive behavior
  private aggressiveness: number = 1.0; // Multiplier that increases over time
  private timeSinceLastSeen: number = 0;
  private pursuitMode: 'patrol' | 'chase' | 'intercept' = 'patrol';

  constructor(scene: THREE.Scene, startPosition: THREE.Vector3) {
    this.scene = scene;
    this.position = startPosition.clone();
    this.velocity = new THREE.Vector3();
    this.currentSpeed = this.baseSpeed;

    this.mesh = this.createHunterMesh();
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);

    console.log('👹 NPC Hunter initialized with advanced physics');
  }

  /**
   * Create hunter NPC mesh (menacing appearance)
   */
  private createHunterMesh(): THREE.Group {
    const hunter = new THREE.Group();

    // Body (slightly larger than player)
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.1;
    body.castShadow = true;
    hunter.add(body);

    // Head (angular, menacing)
    const headGeometry = new THREE.ConeGeometry(0.3, 0.6, 6);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.7
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.1;
    head.rotation.x = Math.PI;
    head.castShadow = true;
    hunter.add(head);

    // Eyes (glowing)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 2.0, 0.25);
    hunter.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 2.0, 0.25);
    hunter.add(rightEye);

    // Threat aura
    const auraGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.15
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.position.y = 1.0;
    hunter.add(aura);

    // Pulsing effect for aura
    const auraAnimation = () => {
      if (aura.parent) {
        aura.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.2);
        requestAnimationFrame(auraAnimation);
      }
    };
    auraAnimation();

    return hunter;
  }

  /**
   * Advanced physics-based update with predictive interception
   */
  update(
    delta: number, 
    playerPosition: THREE.Vector3, 
    playerVelocity: THREE.Vector3,
    playerSpeed: number,
    buildings: THREE.Mesh[],
    gameTime: number
  ): boolean {
    // Increase aggressiveness over time to guarantee catch within 5 minutes
    this.aggressiveness = 1.0 + (gameTime / 300) * 2.0; // Ramps up to 3x at 5 minutes

    // Calculate distance vector
    const distanceVector = new THREE.Vector3().subVectors(playerPosition, this.position);
    const distanceToPlayer = distanceVector.length();

    // Physics calculation: Compute relative velocity
    const relativeVelocity = new THREE.Vector3().subVectors(playerVelocity, this.velocity);
    
    // Calculate closing rate (how fast we're approaching)
    const distanceDirection = distanceVector.clone().normalize();
    this.closingRate = -relativeVelocity.dot(distanceDirection);

    // Determine pursuit mode based on distance and visibility
    if (distanceToPlayer <= this.detectionRange) {
      this.timeSinceLastSeen = 0;
      
      if (distanceToPlayer < 20) {
        this.pursuitMode = 'intercept';
      } else {
        this.pursuitMode = 'chase';
      }

      // === PREDICTIVE INTERCEPTION ALGORITHM ===
      // Calculate time to intercept using physics
      const playerSpeedMagnitude = playerVelocity.length();
      
      if (playerSpeedMagnitude > 0.1) {
        // Lead targeting: predict where player will be
        // Time to intercept: t = d / (v_hunter - v_player * cos(angle))
        const playerDirection = playerVelocity.clone().normalize();
        const angleToPlayer = distanceDirection.dot(playerDirection);
        
        // Adaptive speed based on distance and closing rate
        this.currentSpeed = this.baseSpeed * this.aggressiveness;
        
        // Speed boost when close
        if (distanceToPlayer < 30) {
          this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed * 1.5);
        }
        
        // Calculate effective closing speed
        const effectiveSpeed = this.currentSpeed - playerSpeedMagnitude * angleToPlayer;
        
        if (effectiveSpeed > 0) {
          // Calculate lead time
          this.leadTime = distanceToPlayer / effectiveSpeed;
          
          // Clamp lead time to reasonable values
          this.leadTime = Math.min(this.leadTime, 3.0);
          
          // Calculate predicted interception point
          this.predictedPosition = playerPosition.clone().add(
            playerVelocity.clone().multiplyScalar(this.leadTime)
          );
          
          this.targetPosition = this.predictedPosition;
        } else {
          // Fallback: if player is moving away faster than we can chase,
          // pursue directly with maximum speed
          this.currentSpeed = this.maxSpeed * this.aggressiveness;
          this.targetPosition = playerPosition.clone();
        }
      } else {
        // Player is stationary - move directly
        this.targetPosition = playerPosition.clone();
        this.currentSpeed = this.maxSpeed * this.aggressiveness;
      }

      // === ADAPTIVE SPEED SCALING ===
      // If closing rate is negative (player escaping), increase speed dramatically
      if (this.closingRate < 0) {
        this.currentSpeed = Math.min(this.maxSpeed * 1.5, this.currentSpeed * 1.8);
      }
      
    } else {
      // Out of detection range - patrol mode
      this.pursuitMode = 'patrol';
      this.timeSinceLastSeen += delta;
      
      // Move to last known position
      if (this.targetPosition) {
        const distanceToTarget = this.position.distanceTo(this.targetPosition);
        if (distanceToTarget < 2) {
          this.targetPosition = null;
        }
      } else {
        // Search pattern - move toward center
        this.targetPosition = new THREE.Vector3(0, 0, 0);
      }
      
      this.currentSpeed = this.baseSpeed;
    }

    // === MOVEMENT EXECUTION WITH OBSTACLE AVOIDANCE ===
    if (this.targetPosition) {
      const direction = new THREE.Vector3()
        .subVectors(this.targetPosition, this.position)
        .normalize();

      // Apply velocity
      this.velocity.copy(direction).multiplyScalar(this.currentSpeed);

      const newPosition = this.position.clone().add(
        this.velocity.clone().multiplyScalar(delta)
      );

      // Advanced obstacle avoidance with multiple attempts
      if (!this.checkCollision(newPosition, buildings)) {
        this.position.copy(newPosition);
      } else {
        // Try multiple avoidance angles
        const avoidanceAngles = [Math.PI / 3, -Math.PI / 3, Math.PI / 2, -Math.PI / 2, Math.PI];
        let moved = false;

        for (const angle of avoidanceAngles) {
          const avoidDirection = direction.clone();
          avoidDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
          const avoidPosition = this.position.clone().add(
            avoidDirection.multiplyScalar(this.currentSpeed * delta)
          );

          if (!this.checkCollision(avoidPosition, buildings)) {
            this.position.copy(avoidPosition);
            moved = true;
            break;
          }
        }

        // If all avoidance failed, try moving backward
        if (!moved) {
          const backwardPos = this.position.clone().add(
            direction.clone().multiplyScalar(-this.currentSpeed * delta * 0.5)
          );
          if (!this.checkCollision(backwardPos, buildings)) {
            this.position.copy(backwardPos);
          }
        }
      }

      this.mesh.position.copy(this.position);

      // Rotate to face target
      const angle = Math.atan2(direction.x, direction.z);
      this.mesh.rotation.y = angle;
    }

    // Keep hunter on ground
    this.position.y = 0;
    this.mesh.position.y = 0;

    // Check if caught player
    return distanceToPlayer <= this.catchRange;
  }

  /**
   * Check collision with buildings
   */
  private checkCollision(newPosition: THREE.Vector3, buildings: THREE.Mesh[]): boolean {
    const hunterRadius = 0.6;

    for (const building of buildings) {
      const buildingBox = new THREE.Box3().setFromObject(building);
      const hunterBox = new THREE.Box3(
        new THREE.Vector3(
          newPosition.x - hunterRadius,
          0,
          newPosition.z - hunterRadius
        ),
        new THREE.Vector3(
          newPosition.x + hunterRadius,
          2.5,
          newPosition.z + hunterRadius
        )
      );

      if (buildingBox.intersectsBox(hunterBox)) {
        return true; // Collision detected
      }
    }

    return false;
  }

  /**
   * Get hunter position
   */
  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  /**
   * Get current pursuit statistics for debugging
   */
  getDebugInfo(): {
    mode: string;
    speed: number;
    leadTime: number;
    closingRate: number;
    aggressiveness: number;
  } {
    return {
      mode: this.pursuitMode,
      speed: this.currentSpeed,
      leadTime: this.leadTime,
      closingRate: this.closingRate,
      aggressiveness: this.aggressiveness
    };
  }

  /**
   * Reset for new round
   */
  reset(newPosition: THREE.Vector3): void {
    this.position.copy(newPosition);
    this.mesh.position.copy(newPosition);
    this.velocity.set(0, 0, 0);
    this.targetPosition = null;
    this.predictedPosition = null;
    this.aggressiveness = 1.0;
    this.timeSinceLastSeen = 0;
    this.pursuitMode = 'patrol';
    this.currentSpeed = this.baseSpeed;
  }

  /**
   * Cleanup
   */
  dispose(): void {
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
