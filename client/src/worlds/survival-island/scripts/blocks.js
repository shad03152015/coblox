import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// Use direct URL paths served by Express
const textures = {
  cactusSide: loadTexture('/world/survival-island/public/textures/cactus_side.png'),
  cactusTop: loadTexture('/world/survival-island/public/textures/cactus_top.png'),
  dirt: loadTexture('/world/survival-island/public/textures/dirt.png'),
  grass: loadTexture('/world/survival-island/public/textures/grass.png'),
  grassSide: loadTexture('/world/survival-island/public/textures/grass_side.png'),
  coalOre: loadTexture('/world/survival-island/public/textures/coal_ore.png'),
  ironOre: loadTexture('/world/survival-island/public/textures/iron_ore.png'),
  jungleTreeSide: loadTexture('/world/survival-island/public/textures/jungle_tree_side.png'),
  jungleTreeTop: loadTexture('/world/survival-island/public/textures/jungle_tree_top.png'),
  jungleLeaves: loadTexture('/world/survival-island/public/textures/jungle_leaves.png'),
  leaves: loadTexture('/world/survival-island/public/textures/leaves.png'),
  treeSide: loadTexture('/world/survival-island/public/textures/tree_side.png'),
  treeTop: loadTexture('/world/survival-island/public/textures/tree_top.png'),
  sand: loadTexture('/world/survival-island/public/textures/sand.png'),
  snow: loadTexture('/world/survival-island/public/textures/snow.png'),
  snowSide: loadTexture('/world/survival-island/public/textures/snow_side.png'),
  stone: loadTexture('/world/survival-island/public/textures/stone.png'),
};

export const blocks = {
  empty: {
    id: 0,
    name: 'empty',
    visible: false
  },
  grass: {
    id: 1,
    name: 'grass',
    material: [
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.grass }), // top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.grassSide })  // back
    ]
  },
  dirt: {
    id: 2,
    name: 'dirt',
    material: new THREE.MeshLambertMaterial({ map: textures.dirt })
  },
  stone: {
    id: 3,
    name: 'stone',
    material: new THREE.MeshLambertMaterial({ map: textures.stone }),
    scale: { x: 30, y: 30, z: 30 },
    scarcity: 0.8
  },
  coalOre: {
    id: 4,
    name: 'coal_ore',
    material: new THREE.MeshLambertMaterial({ map: textures.coalOre }),
    scale: { x: 20, y: 20, z: 20 },
    scarcity: 0.8
  },
  ironOre: {
    id: 5,
    name: 'iron_ore',
    material: new THREE.MeshLambertMaterial({ map: textures.ironOre }),
    scale: { x: 40, y: 40, z: 40 },
    scarcity: 0.9
  },
  tree: {
    id: 6,
    name: 'tree',
    visible: true,
    material: [
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.treeTop }), // top
      new THREE.MeshLambertMaterial({ map: textures.treeTop }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.treeSide })  // back
    ]
  },
  leaves: {
    id: 7,
    name: 'leaves',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.leaves })
  },
  sand: {
    id: 8,
    name: 'sand',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.sand })
  },
  cloud: {
    id: 9,
    name: 'cloud',
    visible: true,
    material: new THREE.MeshBasicMaterial({ color: 0xf0f0f0 })
  },
  snow: {
    id: 10,
    name: 'snow',
    material: [
      new THREE.MeshLambertMaterial({ map: textures.snowSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.snowSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.snow }), // top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.snowSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.snowSide })  // back
    ]
  },
  jungleTree: {
    id: 11,
    name: 'jungleTree',
    material: [
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeTop }),  // top
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeTop }),  // bottom
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide })  // back
    ]
  },
  jungleLeaves: {
    id: 12,
    name: 'jungleLeaves',
    material: new THREE.MeshLambertMaterial({ map: textures.jungleLeaves })
  },
  cactus: {
    id: 13,
    name: 'cactus',
    material: [
      new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.cactusTop }),  // top
      new THREE.MeshLambertMaterial({ map: textures.cactusTop }),  // bottom
      new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.cactusSide })  // back
    ]
  },
  jungleGrass: {
    id: 14,
    name: 'jungleGrass',
    material: [
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // right
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // left
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grass }), // top
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // front
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide })  // back
    ]
  },
};

export const resources = [
  blocks.stone,
  blocks.coalOre,
  blocks.ironOre
];