import * as THREE from 'three';

/**
 * Procedural Neon City Generator
 * Creates a cyberpunk-style city without needing external world files
 */
export class ProceduralCityGenerator {
  private scene: THREE.Scene;
  private cityGroup: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.cityGroup = new THREE.Group();
    this.cityGroup.name = 'neon-city';
    this.scene.add(this.cityGroup);

    console.log('🌆 Procedural Neon City Generator initialized');
  }

  /**
   * Generate the complete neon city
   */
  generate(): void {
    console.log('🏗️ Generating Neon City...');

    // Create ground
    this.createGround();

    // Create city blocks (buildings)
    this.createCityGrid();

    // Add neon lights
    this.addNeonLights();

    // Add ambient glow
    this.addAmbientGlow();

    console.log('✅ Neon City generated successfully');
  }

  /**
   * Create the ground/floor
   */
  private createGround(): void {
    // Dark ground with grid pattern
    const groundSize = 200;
    const geometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.8,
      roughness: 0.2,
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.cityGroup.add(ground);

    // Add grid lines
    const gridHelper = new THREE.GridHelper(groundSize, 40, 0x00ff00, 0x003300);
    gridHelper.position.y = 0.1;
    this.cityGroup.add(gridHelper);
  }

  /**
   * Create a grid of buildings
   */
  private createCityGrid(): void {
    const blockSize = 10;
    const spacing = 15;
    const gridSize = 5; // 5x5 grid of buildings

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        // Skip center area for spawn
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;

        const posX = x * spacing;
        const posZ = z * spacing;
        const height = this.randomHeight(10, 40);

        this.createBuilding(posX, posZ, blockSize, height);
      }
    }
  }

  /**
   * Create a single building
   */
  private createBuilding(x: number, z: number, size: number, height: number): void {
    const building = new THREE.Group();

    // Main structure
    const geometry = new THREE.BoxGeometry(size, height, size);
    const material = new THREE.MeshStandardMaterial({
      color: this.randomBuildingColor(),
      metalness: 0.7,
      roughness: 0.3,
      emissive: this.randomNeonColor(),
      emissiveIntensity: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    building.add(mesh);

    // Add neon accents (vertical strips)
    const accentCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < accentCount; i++) {
      const accentGeometry = new THREE.BoxGeometry(0.5, height, 0.5);
      const accentMaterial = new THREE.MeshStandardMaterial({
        color: this.randomNeonColor(),
        emissive: this.randomNeonColor(),
        emissiveIntensity: 0.8,
      });

      const accent = new THREE.Mesh(accentGeometry, accentMaterial);
      const angle = (Math.PI * 2 * i) / accentCount;
      accent.position.x = Math.cos(angle) * (size / 2 + 0.3);
      accent.position.z = Math.sin(angle) * (size / 2 + 0.3);
      accent.position.y = height / 2;
      building.add(accent);
    }

    // Add top accent (roof light)
    const topGeometry = new THREE.BoxGeometry(size * 0.8, 1, size * 0.8);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: this.randomNeonColor(),
      emissive: this.randomNeonColor(),
      emissiveIntensity: 1,
    });

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height + 0.5;
    building.add(top);

    // Position the building
    building.position.set(x, 0, z);
    this.cityGroup.add(building);
  }

  /**
   * Add atmospheric neon lights
   */
  private addNeonLights(): void {
    const colors = [0x00ff00, 0x00ffff, 0xff00ff, 0xffff00, 0xff0088];
    const lightCount = 20;

    for (let i = 0; i < lightCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const light = new THREE.PointLight(color, 50, 30);

      light.position.set(
        Math.random() * 150 - 75,
        Math.random() * 30 + 10,
        Math.random() * 150 - 75
      );

      this.cityGroup.add(light);
    }
  }

  /**
   * Add ambient glow effect
   */
  private addAmbientGlow(): void {
    // Add hemisphere light for overall ambiance
    const hemiLight = new THREE.HemisphereLight(0x00ff00, 0x0a0a0a, 0.3);
    this.cityGroup.add(hemiLight);

    // Add directional light for shadows
    const dirLight = new THREE.DirectionalLight(0x00ffff, 0.5);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.cityGroup.add(dirLight);
  }

  /**
   * Get random building color (dark gray tones)
   */
  private randomBuildingColor(): number {
    const colors = [0x1a1a1a, 0x2a2a2a, 0x1a2a3a, 0x2a1a2a, 0x1a2a1a];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get random neon color
   */
  private randomNeonColor(): number {
    const colors = [
      0x00ff00, // Green
      0x00ffff, // Cyan
      0xff00ff, // Magenta
      0xffff00, // Yellow
      0xff0088, // Pink
      0x00ff88, // Teal
      0x8800ff, // Purple
      0xff8800, // Orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Get random height for buildings
   */
  private randomHeight(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Clear the city
   */
  clear(): void {
    this.cityGroup.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    this.scene.remove(this.cityGroup);
    this.cityGroup.clear();
  }
}
