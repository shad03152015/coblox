import * as THREE from 'three';

// Import all textures as ES modules for proper Vite bundling
import cactusSideImg from '../../../../world/survival-island/public/textures/cactus_side.png';
import cactusTopImg from '../../../../world/survival-island/public/textures/cactus_top.png';
import dirtImg from '../../../../world/survival-island/public/textures/dirt.png';
import grassImg from '../../../../world/survival-island/public/textures/grass.png';
import grassSideImg from '../../../../world/survival-island/public/textures/grass_side.png';
import coalOreImg from '../../../../world/survival-island/public/textures/coal_ore.png';
import ironOreImg from '../../../../world/survival-island/public/textures/iron_ore.png';
import jungleTreeSideImg from '../../../../world/survival-island/public/textures/jungle_tree_side.png';
import jungleTreeTopImg from '../../../../world/survival-island/public/textures/jungle_tree_top.png';
import jungleLeavesImg from '../../../../world/survival-island/public/textures/jungle_leaves.png';
import leavesImg from '../../../../world/survival-island/public/textures/leaves.png';
import treeSideImg from '../../../../world/survival-island/public/textures/tree_side.png';
import treeTopImg from '../../../../world/survival-island/public/textures/tree_top.png';
import sandImg from '../../../../world/survival-island/public/textures/sand.png';
import snowImg from '../../../../world/survival-island/public/textures/snow.png';
import snowSideImg from '../../../../world/survival-island/public/textures/snow_side.png';
import stoneImg from '../../../../world/survival-island/public/textures/stone.png';

const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const textures = {
  cactusSide: loadTexture(cactusSideImg),
  cactusTop: loadTexture(cactusTopImg),
  dirt: loadTexture(dirtImg),
  grass: loadTexture(grassImg),
  grassSide: loadTexture(grassSideImg),
  coalOre: loadTexture(coalOreImg),
  ironOre: loadTexture(ironOreImg),
  jungleTreeSide: loadTexture(jungleTreeSideImg),
  jungleTreeTop: loadTexture(jungleTreeTopImg),
  jungleLeaves: loadTexture(jungleLeavesImg),
  leaves: loadTexture(leavesImg),
  treeSide: loadTexture(treeSideImg),
  treeTop: loadTexture(treeTopImg),
  sand: loadTexture(sandImg),
  snow: loadTexture(snowImg),
  snowSide: loadTexture(snowSideImg),
  stone: loadTexture(stoneImg),
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