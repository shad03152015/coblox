# Neon City - Minecraft World Viewer

This directory contains a Minecraft 1.16.5 world save that can be loaded and visualized in Coblox.

## World Information

- **Format**: Minecraft Java Edition 1.16.5 (Anvil format)
- **Size**: ~632MB (region files)
- **Dimensions**: Overworld, Nether (DIM-1), The End (DIM1)
- **Region Files**: 150+ `.mca` files in `region/` directory
- **Resource Pack**: `resources.zip` (10.3 MB)

## Implementation Status

### ✅ Completed
- React component wrapper created (`client/src/pages/worlds/NeonCity.tsx`)
- Routing integration with WorldView
- Basic Three.js scene setup
- Required NPM packages installed:
  - `prismarine-viewer` - Minecraft world viewer built on Three.js
  - `prismarine-nbt` - NBT (Named Binary Tag) parser
  - `prismarine-chunk` - Minecraft chunk data parser
  - `minecraft-data` - Version-specific game data

### 🚧 In Progress
- Minecraft world loading infrastructure
- Chunk rendering with Three.js

### 📋 Todo
- Parse `.mca` region files (Anvil format)
- Load chunk data from regions
- Render blocks as Three.js meshes
- Apply Minecraft textures
- Implement camera controls (first-person or orbit)
- Add chunk loading/unloading (performance optimization)
- Implement biome colors
- Add lighting system
- Support for entities and tile entities
- Multiplayer synchronization (optional)

## Technical Architecture

### Technology Stack

**Frontend Framework**: Three.js (already used in SurvivalIsland)

**Minecraft Libraries** (PrismarineJS ecosystem):
- `prismarine-viewer`: Complete viewer built on Three.js
- `prismarine-nbt`: Parse NBT data format
- `prismarine-chunk`: Handle chunk data structures
- `minecraft-data`: Block/item/entity definitions per version

**Alternative Considered**:
- Babylon.js (heavier, overkill)
- Custom parser (too much work)
- PlayCanvas (requires different paradigm)

### File Structure

```
neon-city/
├── region/           # World chunk data (.mca files)
├── DIM-1/           # Nether dimension
├── DIM1/            # The End dimension
├── data/            # World metadata, maps, advancements
├── resources.zip    # Custom resource pack
├── level.dat        # World settings and metadata
└── README.md        # This file
```

### Anvil Format (.mca files)

Region files contain 32×32 chunks. Each chunk is 16×256×16 blocks.

**Reading Process**:
1. Parse `.mca` file header (4KB, chunk offsets)
2. Read chunk NBT data (compressed with zlib)
3. Extract block states, biomes, heightmaps
4. Convert to renderable geometry

## Implementation Guide

### Step 1: Parse Level Data

```typescript
import { NBT } from 'prismarine-nbt';

// Read level.dat to get world info
const levelData = await fs.readFile('level.dat');
const { parsed } = await NBT.parse(levelData);
const worldName = parsed.value.Data.value.LevelName.value;
const version = parsed.value.Data.value.Version.value.Name.value;
```

### Step 2: Load Region File

```typescript
import { RegionFile } from 'prismarine-chunk';

// Load a specific region
const regionX = 0, regionZ = 0;
const regionPath = `region/r.${regionX}.${regionZ}.mca`;
const regionFile = new RegionFile(regionPath);

// Get chunk at position (chunkX, chunkZ) within region
const chunk = await regionFile.getChunk(chunkX, chunkZ);
```

### Step 3: Render Chunks with Three.js

```typescript
import * as THREE from 'three';
import { Chunk } from 'prismarine-chunk';

function renderChunk(chunk: Chunk, scene: THREE.Scene) {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];

  // Iterate through blocks in chunk
  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      for (let y = 0; y < 256; y++) {
        const block = chunk.getBlock(x, y, z);
        if (block.type === 0) continue; // Skip air

        // Add block geometry
        addBlockFaces(positions, uvs, x, y, z, block);
      }
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  const material = new THREE.MeshBasicMaterial({ /* texture */ });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}
```

### Step 4: Use prismarine-viewer (Easier Approach)

```typescript
import { Viewer } from 'prismarine-viewer';

// Create viewer instance
const viewer = new Viewer({
  version: '1.16.5',
  canvas: canvasElement,
  renderDistance: 6 // chunks
});

// Load world from directory
await viewer.loadWorld('/path/to/neon-city');

// Camera controls
viewer.camera.position.set(0, 80, 0);
```

## Browser Compatibility Notes

### Challenges:
1. **File System Access**: Browser can't directly read local files
2. **Large File Sizes**: 632MB of region data
3. **Memory Constraints**: Browser memory limits

### Solutions:
1. **Serve Files**: Use Vite's static file serving
2. **Lazy Loading**: Load chunks on demand
3. **Worker Threads**: Parse NBT data in Web Workers
4. **IndexedDB**: Cache parsed chunk data

### Recommended Approach:

```typescript
// Fetch region file from static server
const response = await fetch('/world/neon-city/region/r.0.0.mca');
const arrayBuffer = await response.arrayBuffer();
const regionData = new Uint8Array(arrayBuffer);

// Parse in Web Worker (avoid blocking main thread)
const worker = new Worker('/workers/chunk-parser.js');
worker.postMessage({ regionData, chunkX, chunkZ });
worker.onmessage = (e) => {
  const chunkData = e.data;
  renderChunk(chunkData);
};
```

## Performance Optimizations

1. **Chunk LOD (Level of Detail)**
   - Near chunks: Full detail
   - Far chunks: Simplified geometry
   - Very far: Billboard sprites

2. **Frustum Culling**
   - Only render visible chunks
   - Use Three.js's built-in culling

3. **Greedy Meshing**
   - Merge adjacent blocks of same type
   - Reduce draw calls drastically

4. **Texture Atlases**
   - Combine all block textures
   - Single texture for entire world
   - Included in `resources.zip`

5. **Web Workers**
   - Parse NBT in background
   - Generate geometry off main thread
   - Use `OffscreenCanvas` for rendering prep

## Resource Pack Integration

The `resources.zip` contains custom textures and models.

```typescript
import JSZip from 'jszip';

// Load resource pack
const response = await fetch('/world/neon-city/resources.zip');
const zipData = await response.arrayBuffer();
const zip = await JSZip.loadAsync(zipData);

// Extract textures
const textureFiles = zip.folder('assets/minecraft/textures/block');
const stoneTexture = await textureFiles.file('stone.png').async('blob');
const texture = new THREE.TextureLoader().load(URL.createObjectURL(stoneTexture));
```

## Testing Access

Navigate to: `/world/neon-city`

This will route to the NeonCity React component which initializes the Three.js scene.

## Next Steps

1. **Phase 1**: Load and display one region file
2. **Phase 2**: Implement chunk streaming
3. **Phase 3**: Add player controls
4. **Phase 4**: Optimize rendering performance
5. **Phase 5**: Add multiplayer support (sync with backend)

## References

- [PrismarineJS Documentation](https://github.com/PrismarineJS)
- [Minecraft Wiki - Anvil Format](https://minecraft.fandom.com/wiki/Anvil_file_format)
- [Three.js Documentation](https://threejs.org/docs/)
- [prismarine-viewer Examples](https://github.com/PrismarineJS/prismarine-viewer/tree/master/examples)

## Contributing

To contribute to the Minecraft world loading implementation:

1. Check the Todo section above
2. Create a feature branch
3. Implement one feature at a time
4. Test thoroughly (large world = performance critical)
5. Submit PR with performance benchmarks

## License

This world save and implementation follows the Coblox project license.
