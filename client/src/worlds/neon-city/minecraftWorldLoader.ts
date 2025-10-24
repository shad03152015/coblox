import * as THREE from 'three';
import minecraftData from 'minecraft-data';
import * as pako from 'pako';
// @ts-ignore - prismarine packages don't have proper TS types
import { parseNbt } from 'prismarine-nbt';

/**
 * Minecraft World Loader for Neon City
 * Loads and renders Minecraft 1.16.5 world chunks
 * Browser-compatible version using pako for decompression
 */
export class MinecraftWorldLoader {
  private scene: THREE.Scene;
  private mcData: any;
  private loadedChunks: Map<string, THREE.Group>;
  private worldPath: string;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.mcData = minecraftData('1.16.5');
    this.loadedChunks = new Map();
    this.worldPath = '/world/neon-city';

    console.log('🌍 Minecraft World Loader initialized for version 1.16.5');
  }

  /**
   * Get chunk key for storage
   */
  private getChunkKey(chunkX: number, chunkZ: number): string {
    return `${chunkX},${chunkZ}`;
  }

  /**
   * Get region coordinates from chunk coordinates
   */
  private getRegionCoords(chunkX: number, chunkZ: number): { regionX: number, regionZ: number } {
    return {
      regionX: Math.floor(chunkX / 32),
      regionZ: Math.floor(chunkZ / 32)
    };
  }

  /**
   * Load a single chunk from the world
   */
  async loadChunk(chunkX: number, chunkZ: number): Promise<void> {
    const chunkKey = this.getChunkKey(chunkX, chunkZ);

    // Skip if already loaded
    if (this.loadedChunks.has(chunkKey)) {
      return;
    }

    try {
      const { regionX, regionZ } = this.getRegionCoords(chunkX, chunkZ);
      const regionFile = `r.${regionX}.${regionZ}.mca`;
      const regionPath = `${this.worldPath}/region/${regionFile}`;

      console.log(`📦 Loading chunk (${chunkX}, ${chunkZ}) from region ${regionFile}`);

      // Fetch region file
      const response = await fetch(regionPath);
      if (!response.ok) {
        console.warn(`Region file not found: ${regionFile}`);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Parse the region file to get the specific chunk
      const chunkData = await this.parseChunkFromRegion(buffer, chunkX, chunkZ);

      if (chunkData) {
        // Render the chunk
        const chunkMesh = this.renderChunk(chunkData, chunkX, chunkZ);
        if (chunkMesh) {
          this.scene.add(chunkMesh);
          this.loadedChunks.set(chunkKey, chunkMesh);
          console.log(`✅ Chunk (${chunkX}, ${chunkZ}) loaded successfully`);
        }
      }

    } catch (error) {
      console.error(`Error loading chunk (${chunkX}, ${chunkZ}):`, error);
    }
  }

  /**
   * Parse a specific chunk from a region file
   */
  private async parseChunkFromRegion(regionBuffer: Buffer, chunkX: number, chunkZ: number): Promise<any> {
    try {
      // Get local chunk coordinates within region (0-31)
      const localX = ((chunkX % 32) + 32) % 32;
      const localZ = ((chunkZ % 32) + 32) % 32;

      // Region file format: 8192-byte header (4 bytes per chunk location, 4 bytes per timestamp)
      const headerIndex = (localX + localZ * 32) * 4;

      // Read chunk offset and sector count
      const offset = regionBuffer.readUInt8(headerIndex) << 16 |
                     regionBuffer.readUInt16BE(headerIndex + 1);
      const sectorCount = regionBuffer.readUInt8(headerIndex + 3);

      if (offset === 0 || sectorCount === 0) {
        // Chunk doesn't exist in this region
        return null;
      }

      // Convert offset to bytes (sectors are 4KB)
      const byteOffset = offset * 4096;

      // Read chunk length
      const length = regionBuffer.readUInt32BE(byteOffset);
      const compressionType = regionBuffer.readUInt8(byteOffset + 4);

      // Read chunk data
      const chunkData = regionBuffer.slice(byteOffset + 5, byteOffset + 4 + length);

      // Parse NBT data - use pako for browser-compatible decompression
      let decompressed: Buffer;
      if (compressionType === 2) {
        // Zlib compression - use pako
        const inflated = pako.inflate(chunkData);
        decompressed = Buffer.from(inflated);
      } else if (compressionType === 1) {
        // Gzip compression - use pako
        const ungzipped = pako.ungzip(chunkData);
        decompressed = Buffer.from(ungzipped);
      } else {
        decompressed = chunkData;
      }

      const { parsed } = await parseNbt(decompressed);
      return parsed;

    } catch (error) {
      console.error(`Error parsing chunk from region:`, error);
      return null;
    }
  }

  /**
   * Render a chunk as Three.js mesh
   */
  private renderChunk(chunkData: any, chunkX: number, chunkZ: number): THREE.Group | null {
    try {
      const chunkGroup = new THREE.Group();
      chunkGroup.name = `chunk_${chunkX}_${chunkZ}`;

      // Get chunk sections
      const level = chunkData.value?.Level?.value || chunkData.value;
      const sections = level?.Sections?.value || [];

      if (!sections || sections.length === 0) {
        return null;
      }

      // Process each section (16x16x16 blocks) - only render surface sections to reduce memory
      let renderedSections = 0;
      sections.forEach((section: any) => {
        const sectionY = section.Y?.value || 0;

        // Only render surface sections (Y >= 4) to drastically reduce memory usage
        if (sectionY < 4) {
          return;
        }

        // Skip empty sections
        if (!section.Palette || !section.BlockStates) {
          return;
        }

        const palette = section.Palette.value;
        const blockStates = section.BlockStates.value;

        // Create geometry for this section
        const sectionMesh = this.renderSection(palette, blockStates, chunkX, chunkZ, sectionY);
        if (sectionMesh) {
          chunkGroup.add(sectionMesh);
          renderedSections++;
        }
      });

      console.log(`  📊 Rendered ${renderedSections} surface sections for chunk (${chunkX}, ${chunkZ})`);

      // Position the chunk group
      chunkGroup.position.set(chunkX * 16, 0, chunkZ * 16);

      return chunkGroup;

    } catch (error) {
      console.error(`Error rendering chunk:`, error);
      return null;
    }
  }

  /**
   * Render a single section (16x16x16 blocks)
   */
  private renderSection(
    palette: any[],
    blockStates: number[],
    chunkX: number,
    chunkZ: number,
    sectionY: number
  ): THREE.Mesh | null {
    try {
      // Use instanced mesh for better performance
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshLambertMaterial({
        vertexColors: true
      });

      const mesh = new THREE.InstancedMesh(geometry, material, 4096);
      const dummy = new THREE.Object3D();
      const color = new THREE.Color();

      let instanceIndex = 0;

      // Iterate through all blocks in the section
      for (let y = 0; y < 16; y++) {
        for (let z = 0; z < 16; z++) {
          for (let x = 0; x < 16; x++) {
            const blockIndex = y * 256 + z * 16 + x;

            // Get block ID from palette using block states
            const paletteIndex = this.getBlockStateIndex(blockStates, blockIndex, palette.length);
            const blockData = palette[paletteIndex];

            if (!blockData || !blockData.Name) {
              continue;
            }

            const blockName = blockData.Name.value;

            // Skip air blocks
            if (blockName.includes('air')) {
              continue;
            }

            // Get block color
            const blockColor = this.getBlockColor(blockName);
            color.setHex(blockColor);

            // Set position
            const worldY = sectionY * 16 + y;
            dummy.position.set(x, worldY, z);
            dummy.updateMatrix();

            mesh.setMatrixAt(instanceIndex, dummy.matrix);
            mesh.setColorAt(instanceIndex, color);

            instanceIndex++;

            if (instanceIndex >= 4096) {
              break;
            }
          }
        }
      }

      mesh.count = instanceIndex;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }

      return mesh;

    } catch (error) {
      console.error(`Error rendering section:`, error);
      return null;
    }
  }

  /**
   * Get block state index from packed long array
   */
  private getBlockStateIndex(blockStates: number[], index: number, paletteSize: number): number {
    const bitsPerBlock = Math.max(4, Math.ceil(Math.log2(paletteSize)));
    const blocksPerLong = Math.floor(64 / bitsPerBlock);
    const longIndex = Math.floor(index / blocksPerLong);
    const startBit = (index % blocksPerLong) * bitsPerBlock;

    if (longIndex >= blockStates.length) {
      return 0;
    }

    const value = blockStates[longIndex];
    const mask = (1 << bitsPerBlock) - 1;

    return (value >> startBit) & mask;
  }

  /**
   * Get color for a Minecraft block
   */
  private getBlockColor(blockName: string): number {
    // Remove minecraft: prefix
    const name = blockName.replace('minecraft:', '');

    // Color mapping for common blocks
    const colorMap: { [key: string]: number } = {
      'grass_block': 0x7cbd6b,
      'dirt': 0x8b6f47,
      'stone': 0x808080,
      'cobblestone': 0x7f7f7f,
      'oak_log': 0x9c7f4f,
      'oak_planks': 0xa0826d,
      'oak_leaves': 0x5a8b3d,
      'water': 0x3f76e4,
      'sand': 0xdbd3a0,
      'sandstone': 0xe0d8a8,
      'glass': 0xe0f8ff,
      'wool': 0xf0f0f0,
      'concrete': 0xd0d0d0,
      'concrete_powder': 0xe0e0e0,
      'terracotta': 0x9c5c3c,
      'brick': 0x963c32,
      'nether_brick': 0x2c1718,
      'quartz': 0xf0ebe4,
      'glowstone': 0xf9e6a0,
      'sea_lantern': 0xb0d5d5,
      'bedrock': 0x565656,
      'iron_block': 0xd8d8d8,
      'gold_block': 0xfcee4b,
      'diamond_block': 0x5decf5,
      'emerald_block': 0x17dd62,
    };

    // Check for exact match
    if (colorMap[name]) {
      return colorMap[name];
    }

    // Check for partial matches
    for (const [key, color] of Object.entries(colorMap)) {
      if (name.includes(key)) {
        return color;
      }
    }

    // Default colors based on block type
    if (name.includes('log') || name.includes('wood')) return 0x9c7f4f;
    if (name.includes('leaves')) return 0x5a8b3d;
    if (name.includes('stone')) return 0x808080;
    if (name.includes('sand')) return 0xdbd3a0;
    if (name.includes('dirt')) return 0x8b6f47;
    if (name.includes('grass')) return 0x7cbd6b;
    if (name.includes('water') || name.includes('ice')) return 0x3f76e4;
    if (name.includes('glass')) return 0xe0f8ff;
    if (name.includes('wool')) return 0xf0f0f0;
    if (name.includes('concrete')) return 0xd0d0d0;
    if (name.includes('brick')) return 0x963c32;
    if (name.includes('neon') || name.includes('glow')) return 0x00ff00;

    // Default gray for unknown blocks
    return 0x999999;
  }

  /**
   * Load multiple chunks around a center point
   */
  async loadChunksAround(centerX: number, centerZ: number, radius: number = 2): Promise<void> {
    const chunkX = Math.floor(centerX / 16);
    const chunkZ = Math.floor(centerZ / 16);

    const totalChunks = (radius * 2 + 1) ** 2;
    console.log(`🌍 Loading ${totalChunks} chunks around (${chunkX}, ${chunkZ}) progressively...`);

    let loadedCount = 0;

    // Load chunks sequentially with small delay to prevent memory overflow
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        await this.loadChunk(chunkX + dx, chunkZ + dz);
        loadedCount++;
        
        // Small delay between chunks to allow garbage collection
        if (loadedCount % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }

    console.log(`✅ Finished loading ${loadedCount} chunks`);
  }

  /**
   * Unload a chunk
   */
  unloadChunk(chunkX: number, chunkZ: number): void {
    const chunkKey = this.getChunkKey(chunkX, chunkZ);
    const chunkGroup = this.loadedChunks.get(chunkKey);

    if (chunkGroup) {
      this.scene.remove(chunkGroup);

      // Dispose geometries and materials
      chunkGroup.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      this.loadedChunks.delete(chunkKey);
    }
  }

  /**
   * Get number of loaded chunks
   */
  getLoadedChunkCount(): number {
    return this.loadedChunks.size;
  }

  /**
   * Clear all loaded chunks
   */
  clearAll(): void {
    this.loadedChunks.forEach((_, chunkKey) => {
      const [chunkX, chunkZ] = chunkKey.split(',').map(Number);
      this.unloadChunk(chunkX, chunkZ);
    });
    this.loadedChunks.clear();
  }
}