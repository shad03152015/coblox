import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Import textures
import grassTexture from "../../../world/survival-island/public/textures/grass.png";
import dirtTexture from "../../../world/survival-island/public/textures/dirt.png";
import stoneTexture from "../../../world/survival-island/public/textures/stone.png";
import coalOreTexture from "../../../world/survival-island/public/textures/coal_ore.png";
import ironOreTexture from "../../../world/survival-island/public/textures/iron_ore.png";
import treeTopTexture from "../../../world/survival-island/public/textures/tree_top.png";
import leavesTexture from "../../../world/survival-island/public/textures/leaves.png";
import sandTexture from "../../../world/survival-island/public/textures/sand.png";
import pickaxeTexture from "../../../world/survival-island/public/textures/pickaxe.png";

// Import game modules from survival-island
// Note: These will need to be converted to TypeScript or imported as JS modules
// For now, we'll create a wrapper that initializes the game

export default function SurvivalIsland() {
  const [, setLocation] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    stats?: any;
    animationId?: number;
    resizeHandler?: () => void;
  }>({});

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to play");
      setLocation("/");
      return;
    }

    // Initialize the game
    const initGame = async () => {
      if (!containerRef.current) return;

      try {
        // Import game modules dynamically
        const { World } = await import(
          "../../../world/survival-island/scripts/world.js"
        );
        const { Player } = await import(
          "../../../world/survival-island/scripts/player.js"
        );
        const { Physics } = await import(
          "../../../world/survival-island/scripts/physics.js"
        );
        const { setupUI } = await import(
          "../../../world/survival-island/scripts/ui.js"
        );
        const { ModelLoader } = await import(
          "../../../world/survival-island/scripts/modelLoader.js"
        );

        // Stats setup
        const stats = new Stats();
        containerRef.current.appendChild(stats.dom);
        gameRef.current.stats = stats;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x80a0e0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);
        gameRef.current.renderer = renderer;

        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x80a0e0, 50, 75);

        const world = new World();
        world.generate();
        scene.add(world);

        const player = new Player(scene, world);
        const physics = new Physics(scene);

        // Camera setup
        const orbitCamera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        orbitCamera.position.set(24, 24, 24);
        orbitCamera.layers.enable(1);

        const controls = new OrbitControls(orbitCamera, renderer.domElement);
        controls.update();

        const modelLoader = new ModelLoader((models: any) => {
          player.setTool(models.pickaxe);
        });

        // Lights setup
        const sun = new THREE.DirectionalLight();
        sun.intensity = 1.5;
        sun.position.set(50, 50, 50);
        sun.castShadow = true;
        sun.shadow.camera.left = -40;
        sun.shadow.camera.right = 40;
        sun.shadow.camera.top = 40;
        sun.shadow.camera.bottom = -40;
        sun.shadow.camera.near = 0.1;
        sun.shadow.camera.far = 200;
        sun.shadow.bias = -0.0001;
        sun.shadow.mapSize = new THREE.Vector2(2048, 2048);
        scene.add(sun);
        scene.add(sun.target);

        const ambient = new THREE.AmbientLight();
        ambient.intensity = 0.2;
        scene.add(ambient);

        // Render loop
        let previousTime = performance.now();
        function animate() {
          const animationId = requestAnimationFrame(animate);
          gameRef.current.animationId = animationId;

          const currentTime = performance.now();
          const dt = (currentTime - previousTime) / 1000;

          // Only update physics when player controls are locked
          if (player.controls.isLocked) {
            physics.update(dt, player, world);
            player.update(world);
            world.update(player);

            // Position the sun relative to the player
            sun.position.copy(player.camera.position);
            sun.position.sub(new THREE.Vector3(-50, -50, -50));
            sun.target.position.copy(player.camera.position);

            // Update position of the orbit camera to track player
            orbitCamera.position
              .copy(player.position)
              .add(new THREE.Vector3(16, 16, 16));
            controls.target.copy(player.position);
          }

          renderer.render(
            scene,
            player.controls.isLocked ? player.camera : orbitCamera
          );
          stats.update();

          previousTime = currentTime;
        }

        // Resize handler
        const handleResize = () => {
          orbitCamera.aspect = window.innerWidth / window.innerHeight;
          orbitCamera.updateProjectionMatrix();
          player.camera.aspect = window.innerWidth / window.innerHeight;
          player.camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        gameRef.current.resizeHandler = handleResize;

        // Setup UI
        setupUI(world, player, physics, scene);

        // Start animation loop
        animate();
      } catch (error) {
        console.error("Error initializing Survival Island game:", error);
        toast.error("Failed to load game. Please try again.");
      }
    };

    initGame();

    // Cleanup function
    return () => {
      // Cancel animation frame
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }

      // Remove resize listener
      if (gameRef.current.resizeHandler) {
        window.removeEventListener("resize", gameRef.current.resizeHandler);
      }

      // Dispose renderer
      if (gameRef.current.renderer) {
        gameRef.current.renderer.dispose();
        gameRef.current.renderer.domElement.remove();
      }

      // Remove stats
      if (gameRef.current.stats && gameRef.current.stats.dom) {
        gameRef.current.stats.dom.remove();
      }
    };
  }, [setLocation]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
        backgroundColor: "#80a0e0",
      }}
    >
      {/* Game UI overlay elements */}
      <div
        id="info"
        style={{
          position: "absolute",
          fontFamily: "sans-serif",
          fontSize: "24px",
          right: 0,
          bottom: 0,
          color: "white",
          margin: "8px",
        }}
      >
        <div id="info-player-position"></div>
      </div>

      <div
        id="toolbar-container"
        style={{
          position: "fixed",
          bottom: "8px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          id="toolbar"
          style={{
            backgroundColor: "rgb(109, 109, 109)",
            border: "4px solid rgb(147, 147, 147)",
            padding: "8px",
            display: "flex",
            justifyContent: "space-between",
            columnGap: "12px",
          }}
        >
          <img
            className="toolbar-icon"
            id="toolbar-1"
            src={grassTexture}
            alt="Grass"
            style={{ width: "64px", height: "64px", outline: "4px solid rgb(58, 58, 58)" }}
          />
          <img
            className="toolbar-icon"
            id="toolbar-2"
            src={dirtTexture}
            alt="Dirt"
            style={{ width: "64px", height: "64px", outline: "4px solid rgb(58, 58, 58)" }}
          />
          <img
            className="toolbar-icon"
            id="toolbar-3"
            src={stoneTexture}
            alt="Stone"
            style={{ width: "64px", height: "64px", outline: "4px solid rgb(58, 58, 58)" }}
          />
          <img
            className="toolbar-icon"
            id="toolbar-4"
            src={coalOreTexture}
            alt="Coal Ore"
            style={{ width: "64px", height: "64px", outline: "4px solid rgb(58, 58, 58)" }}
          />
          <img
            className="toolbar-icon"
            id="toolbar-5"
            src={ironOreTexture}
            alt="Iron Ore"
            style={{ width: "64px", height: "64px", outline: "4px solid rgb(58, 58, 58)" }}
          />
          <img
            className="toolbar-icon"
            id="toolbar-6"
            src={treeTopTexture}
            alt="Tree"
            style={{ width: "64px", height: "64px", outline: "4px solid rgb(58, 58, 58)" }}
          />
          <img
            className="toolbar-icon"
            id="toolbar-7"
            src={leavesTexture}
            alt="Leaves"
            style={{ width: "64px", height: "64px", outline: "4px solid rgb(58, 58, 58)" }}
          />
          <img
            className="toolbar-icon"
            id="toolbar-8"
            src={sandTexture}
            alt="Sand"
            style={{ width: "64px", height: "64px", outline: "4px solid rgb(58, 58, 58)" }}
          />
          <img
            className="toolbar-icon selected"
            id="toolbar-0"
            src={pickaxeTexture}
            alt="Pickaxe"
            style={{ width: "64px", height: "64px", outline: "4px solid white" }}
          />
        </div>
      </div>

      <div
        id="overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: "#00000080",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "2em",
          color: "white",
          textAlign: "center",
        }}
      >
        <div id="instructions">
          <h1 style={{ fontSize: "3em" }}>MINECRAFTjs</h1>
          WASD - Move
          <br />
          SHIFT - Sprint
          <br />
          SPACE - Jump
          <br />
          R - Reset Camera
          <br />
          U - Toggle UI
          <br />
          0 - Pickaxe
          <br />
          1-8 - Select Block
          <br />
          F1 - Save Game
          <br />
          F2 - Load Game
          <br />
          F10 - Debug Camera
          <br />
          <br />
          <h2>PRESS ANY KEY TO START</h2>
        </div>
      </div>

      <div
        id="status"
        style={{
          position: "fixed",
          bottom: "8px",
          left: "8px",
          fontSize: "2em",
          color: "white",
        }}
      ></div>
    </div>
  );
}
