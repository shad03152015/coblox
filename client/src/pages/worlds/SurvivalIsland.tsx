import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { io, Socket } from "socket.io-client";

// Texture URLs - use direct paths served by Express /world route
const grassTexture = "/world/survival-island/public/textures/grass.png";
const dirtTexture = "/world/survival-island/public/textures/dirt.png";
const stoneTexture = "/world/survival-island/public/textures/stone.png";
const coalOreTexture = "/world/survival-island/public/textures/coal_ore.png";
const ironOreTexture = "/world/survival-island/public/textures/iron_ore.png";
const treeTopTexture = "/world/survival-island/public/textures/tree_top.png";
const leavesTexture = "/world/survival-island/public/textures/leaves.png";
const sandTexture = "/world/survival-island/public/textures/sand.png";
const pickaxeTexture = "/world/survival-island/public/textures/pickaxe.png";

export default function SurvivalIsland() {
  const [, setLocation] = useLocation();
  const [playerCount, setPlayerCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    stats?: any;
    animationId?: number;
    resizeHandler?: () => void;
    socket?: Socket;
    multiplayerManager?: any;
    player?: any;
    world?: any;
  }>({});

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to play");
      setLocation("/");
      return;
    }

    // Get user data for multiplayer
    const getUserData = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          userId: payload.userId,
          username: payload.username || 'Player'
        };
      } catch {
        return { userId: 'unknown', username: 'Player' };
      }
    };

    const userData = getUserData();

    // Initialize the game
    const initGame = async () => {
      if (!containerRef.current) return;

      try {
        console.log('🎮 Initializing Survival Island...');
        
        // Import game modules dynamically
        console.log('📦 Loading game modules...');
        const { World } = await import(
          "../../worlds/survival-island/scripts/world.js"
        ).catch(err => {
          console.error('❌ Failed to load World module:', err);
          throw new Error('Failed to load World module');
        });
        
        const { Player } = await import(
          "../../worlds/survival-island/scripts/player.js"
        ).catch(err => {
          console.error('❌ Failed to load Player module:', err);
          throw new Error('Failed to load Player module');
        });
        
        const { Physics } = await import(
          "../../worlds/survival-island/scripts/physics.js"
        ).catch(err => {
          console.error('❌ Failed to load Physics module:', err);
          throw new Error('Failed to load Physics module');
        });
        
        const { setupUI } = await import(
          "../../worlds/survival-island/scripts/ui.js"
        ).catch(err => {
          console.error('❌ Failed to load UI module:', err);
          throw new Error('Failed to load UI module');
        });
        
        const { ModelLoader } = await import(
          "../../worlds/survival-island/scripts/modelLoader.js"
        ).catch(err => {
          console.error('❌ Failed to load ModelLoader module:', err);
          throw new Error('Failed to load ModelLoader module');
        });
        
        const { MultiplayerManager } = await import(
          "../../worlds/survival-island/scripts/multiplayerManager.js"
        ).catch(err => {
          console.error('❌ Failed to load MultiplayerManager module:', err);
          throw new Error('Failed to load MultiplayerManager module');
        });

        console.log('✅ All modules loaded successfully');

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
        gameRef.current.world = world;

        const player = new Player(scene, world);
        const physics = new Physics(scene);
        gameRef.current.player = player;

        // Initialize Multiplayer Manager
        const multiplayerManager = new MultiplayerManager(scene);
        gameRef.current.multiplayerManager = multiplayerManager;

        // Initialize Socket.io connection
        const socket = io(window.location.origin, {
          auth: { token }
        });
        gameRef.current.socket = socket;

        // Socket event handlers
        socket.on('connect', () => {
          console.log('🌐 Connected to multiplayer server');
          toast.success('Connected to multiplayer');

          // Join the survival-island world
          socket.emit('join-world', {
            worldId: 'survival-island',
            username: userData.username
          });
        });

        socket.on('disconnect', (reason) => {
          console.log('🔌 Disconnected from multiplayer server:', reason);
          toast.error('Disconnected from multiplayer');
          
          // Clear all other players from the scene when disconnected
          if (multiplayerManager) {
            multiplayerManager.clearAllPlayers();
            setPlayerCount(0);
          }
        });

        socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          toast.error('Failed to connect to multiplayer server');
        });

        socket.on('existing-players', (players: any[]) => {
          console.log(`👥 Received ${players.length} existing players`);
          multiplayerManager.handleExistingPlayers(players);
          setPlayerCount(players.length);
        });

        socket.on('player-joined', (playerData: any) => {
          console.log(`✅ Player joined: ${playerData.username}`);
          multiplayerManager.createPlayerAvatar(playerData);
          setPlayerCount(multiplayerManager.getPlayerCount());
          toast.success(`${playerData.username} joined`);
        });

        socket.on('player-moved', (data: any) => {
          multiplayerManager.updatePlayerPosition(data.id, data.position, data.rotation);
        });

        socket.on('player-left', (data: any) => {
          console.log(`👋 Player left: ${data.id}`);
          multiplayerManager.removePlayer(data.id);
          setPlayerCount(multiplayerManager.getPlayerCount());
        });

        socket.on('block-placed', (data: any) => {
          // Sync block placement from other players
          if (world && data.playerId !== socket.id) {
            world.addBlockAt(data.position.x, data.position.y, data.position.z, data.blockId);
          }
        });

        socket.on('block-destroyed', (data: any) => {
          // Sync block destruction from other players
          if (world && data.playerId !== socket.id) {
            world.removeBlockAt(data.position.x, data.position.y, data.position.z);
          }
        });

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

        // Track last sent position to avoid sending duplicates
        let lastSentPosition = { x: 0, y: 0, z: 0 };
        let lastSentRotation = { x: 0, y: 0 };
        let positionUpdateTimer = 0;

        // Override world's block add/remove to emit socket events
        const originalAddBlock = world.addBlockAt;
        world.addBlockAt = function(x: number, y: number, z: number, blockId: number) {
          const result = originalAddBlock.call(world, x, y, z, blockId);
          if (result && socket.connected) {
            socket.emit('block-placed', {
              position: { x, y, z },
              blockId,
              worldId: 'survival-island'
            });
          }
          return result;
        };

        const originalRemoveBlock = world.removeBlockAt;
        world.removeBlockAt = function(x: number, y: number, z: number) {
          const result = originalRemoveBlock.call(world, x, y, z);
          if (result && socket.connected) {
            socket.emit('block-destroyed', {
              position: { x, y, z },
              worldId: 'survival-island'
            });
          }
          return result;
        };

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

            // Send position updates to server periodically (10 times per second)
            positionUpdateTimer += dt;
            if (positionUpdateTimer >= 0.1) {
              positionUpdateTimer = 0;

              const currentPos = player.position;
              const currentRot = player.camera.rotation;

              // Only send if position or rotation changed significantly
              const posChanged = Math.abs(currentPos.x - lastSentPosition.x) > 0.01 ||
                                Math.abs(currentPos.y - lastSentPosition.y) > 0.01 ||
                                Math.abs(currentPos.z - lastSentPosition.z) > 0.01;
              const rotChanged = Math.abs(currentRot.x - lastSentRotation.x) > 0.01 ||
                                Math.abs(currentRot.y - lastSentRotation.y) > 0.01;

              if ((posChanged || rotChanged) && socket.connected) {
                socket.emit('player-move', {
                  position: { x: currentPos.x, y: currentPos.y, z: currentPos.z },
                  rotation: { x: currentRot.x, y: currentRot.y },
                  worldId: 'survival-island'
                });

                lastSentPosition = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
                lastSentRotation = { x: currentRot.x, y: currentRot.y };
              }
            }
          }

          // Update multiplayer manager (smooth interpolation of other players)
          multiplayerManager.update(dt);

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

        // Lock controls immediately so player starts on the ground
        // Small delay to ensure everything is initialized
        setTimeout(() => {
          try {
            if (player && player.controls && !player.controls.isLocked) {
              player.controls.lock();
              console.log('✅ Player controls locked - character on ground');
            } else {
              console.warn('⚠️ Player or controls not ready for locking');
            }
          } catch (err) {
            console.error('❌ Error during control locking:', err);
          }
        }, 100); // Minimal delay

        // Start animation loop
        animate();
        console.log('✅ Survival Island initialized successfully');
      } catch (error) {
        console.error("❌ Error initializing Survival Island game:", error);
        toast.error(`Failed to load game: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    initGame();

    // Cleanup function
    return () => {
      // Disconnect socket
      if (gameRef.current.socket) {
        gameRef.current.socket.disconnect();
      }

      // Clear multiplayer manager
      if (gameRef.current.multiplayerManager) {
        gameRef.current.multiplayerManager.clearAllPlayers();
      }

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
      {/* Multiplayer player count indicator */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          fontSize: "18px",
          fontFamily: "sans-serif",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "24px" }}>👥</span>
        <span>{playerCount + 1} Player{playerCount !== 0 ? 's' : ''} Online</span>
      </div>

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
