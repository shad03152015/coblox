import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { io, Socket } from "socket.io-client";
import { MultiplayerManager } from "../../worlds/neon-city/multiplayerManager";
import { ProceduralCityGenerator } from "../../worlds/neon-city/proceduralCityGenerator";


export default function NeonCity() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
  const [playerCount, setPlayerCount] = useState(0);
=======
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'caught' | 'escaped'>('playing');
  
  // Round management state
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds] = useState(5);
  const [roundTimer, setRoundTimer] = useState(300); // 5 minutes in seconds
  const [playerWins, setPlayerWins] = useState(0);
  const [hunterWins, setHunterWins] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [roundInProgress, setRoundInProgress] = useState(true);
  
>>>>>>> 345dd89 (Auto-commit: Agent tool execution)
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    animationId?: number;
    resizeHandler?: () => void;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
<<<<<<< HEAD
    controls?: OrbitControls;
    socket?: Socket;
    multiplayerManager?: MultiplayerManager;
=======
    player?: PlayerController;
    hunter?: NPCHunter;
    buildings?: THREE.Mesh[];
    roundStartTime?: number;
    currentRoundTime?: number;
>>>>>>> 345dd89 (Auto-commit: Agent tool execution)
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

    // Initialize the Three.js scene
    const initScene = async () => {
      if (!containerRef.current) return;

      try {
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x0a0a0a);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);
        gameRef.current.renderer = renderer;

        // Scene setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
        gameRef.current.scene = scene;

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );
        camera.position.set(50, 50, 50);
        gameRef.current.camera = camera;

        // Controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 200;
        controls.minDistance = 10;
        gameRef.current.controls = controls;

        // Initialize Multiplayer Manager
        const multiplayerManager = new MultiplayerManager(scene);
        gameRef.current.multiplayerManager = multiplayerManager;

        // Generate procedural neon city with buildings and lights
        console.log('🌆 Generating Neon City...');
        const cityGenerator = new ProceduralCityGenerator(scene);
        cityGenerator.generate();
        console.log('✅ Neon City generated');

        // Initialize Socket.io connection
        const socket = io(window.location.origin, {
          auth: { token }
        });
        gameRef.current.socket = socket;

        // Socket event handlers
        socket.on('connect', () => {
          console.log('🌐 Connected to multiplayer server');
          toast.success('Connected to multiplayer');

          // Join the neon-city world
          socket.emit('join-world', {
            worldId: 'neon-city',
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

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        scene.add(directionalLight);

        // Add text sprite for "NEON CITY - MULTIPLAYER"
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = 512;
          canvas.height = 256;
          context.fillStyle = '#00ff00';
          context.font = 'Bold 48px Arial';
          context.fillText('NEON CITY', 50, 100);
          context.font = '32px Arial';
          context.fillText('CYBERPUNK MULTIPLAYER', 50, 150);
          context.fillText('Explore the neon city', 50, 190);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(0, 20, 0);
        sprite.scale.set(40, 20, 1);
        scene.add(sprite);

        // Track last sent camera position for multiplayer
        let lastSentPosition = { x: 0, y: 0, z: 0 };
        let lastSentRotation = { x: 0, y: 0 };
        let positionUpdateTimer = 0;
        let previousTime = performance.now();
        gameRef.current.roundStartTime = previousTime;
        gameRef.current.currentRoundTime = 0;

        // Function to start new round
        const startNewRound = (roundNumber: number) => {
          console.log(`🎮 Starting Round ${roundNumber}`);
          
          // Reset player to spawn
          player.reset(new THREE.Vector3(0, 0, 0));
          
          // Reset hunter to starting position
          hunter.reset(new THREE.Vector3(40, 0, 40));
          
          // Reset timers
          gameRef.current.roundStartTime = performance.now();
          gameRef.current.currentRoundTime = 0;
          setRoundTimer(300);
          setGameStatus('playing');
          setRoundInProgress(true);
          setDistanceTraveled(0);
          
          toast.success(`Round ${roundNumber} begins! Survive for 5 minutes!`);
        };

        // Function to end round
        const endRound = (playerWon: boolean) => {
          setRoundInProgress(false);
          
          if (playerWon) {
            setPlayerWins(prev => {
              const newWins = prev + 1;
              toast.success(`🎉 Round ${currentRound} - You Escaped! (${newWins}/${currentRound} wins)`, {
                duration: 3000
              });
              return newWins;
            });
            setGameStatus('escaped');
          } else {
            setHunterWins(prev => {
              const newLosses = prev + 1;
              toast.error(`💀 Round ${currentRound} - Caught! Distance: ${player.distanceTraveled.toFixed(1)}m`, {
                duration: 3000
              });
              return newLosses;
            });
            setGameStatus('caught');
          }
          
          // Check if game is over (5 rounds completed)
          if (currentRound >= maxRounds) {
            setTimeout(() => {
              setIsGameOver(true);
              const finalPlayerWins = playerWon ? playerWins + 1 : playerWins;
              const finalHunterWins = playerWon ? hunterWins : hunterWins + 1;
              
              if (finalPlayerWins > finalHunterWins) {
                toast.success(`🏆 GAME OVER - You Win! ${finalPlayerWins}-${finalHunterWins}`, {
                  duration: 5000
                });
              } else if (finalHunterWins > finalPlayerWins) {
                toast.error(`💀 GAME OVER - Hunter Wins! ${finalHunterWins}-${finalPlayerWins}`, {
                  duration: 5000
                });
              } else {
                toast(`🤝 GAME OVER - Tie! ${finalPlayerWins}-${finalHunterWins}`, {
                  duration: 5000
                });
              }
            }, 3000);
          } else {
            // Start next round after delay
            setTimeout(() => {
              setCurrentRound(prev => prev + 1);
              startNewRound(currentRound + 1);
            }, 4000);
          }
        };

        // Animation loop
        function animate() {
          const animationId = requestAnimationFrame(animate);
          gameRef.current.animationId = animationId;

          const currentTime = performance.now();
          const dt = (currentTime - previousTime) / 1000;

<<<<<<< HEAD
          // Update controls
          controls.update();

          // Send camera position updates to server periodically (5 times per second)
          positionUpdateTimer += dt;
          if (positionUpdateTimer >= 0.2) {
            positionUpdateTimer = 0;

            const currentPos = camera.position;
            const currentRot = { x: camera.rotation.x, y: camera.rotation.y };

            // Only send if position or rotation changed significantly
            const posChanged = Math.abs(currentPos.x - lastSentPosition.x) > 0.1 ||
                              Math.abs(currentPos.y - lastSentPosition.y) > 0.1 ||
                              Math.abs(currentPos.z - lastSentPosition.z) > 0.1;
            const rotChanged = Math.abs(currentRot.x - lastSentRotation.x) > 0.01 ||
                              Math.abs(currentRot.y - lastSentRotation.y) > 0.01;

            if ((posChanged || rotChanged) && socket.connected) {
              socket.emit('player-move', {
                position: { x: currentPos.x, y: currentPos.y, z: currentPos.z },
                rotation: { x: currentRot.x, y: currentRot.y },
                worldId: 'neon-city'
              });

              lastSentPosition = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
              lastSentRotation = { x: currentRot.x, y: currentRot.y };
=======
          if (roundInProgress && player.isAlive && buildings && !isGameOver) {
            // Update round timer
            gameRef.current.currentRoundTime = (currentTime - (gameRef.current.roundStartTime || currentTime)) / 1000;
            const timeRemaining = Math.max(0, 300 - gameRef.current.currentRoundTime);
            setRoundTimer(timeRemaining);
            
            // Check if time expired (player wins round)
            if (timeRemaining <= 0) {
              endRound(true);
            }
            
            // Update player
            player.update(dt, buildings, camera);

            // Update hunter with physics parameters
            const caught = hunter.update(
              dt, 
              player.getPosition(),
              player.getVelocity(),
              player.getCurrentSpeed(),
              buildings,
              gameRef.current.currentRoundTime
            );

            if (caught) {
              player.setCaught();
              endRound(false);
>>>>>>> 345dd89 (Auto-commit: Agent tool execution)
            }
          }

          // Update multiplayer manager (smooth interpolation of other players)
          multiplayerManager.update(dt);

          // Update nameplates to face camera
          multiplayerManager.updateNameplates(camera);

          // Render scene
          renderer.render(scene, camera);

          previousTime = currentTime;
        }

        // Resize handler
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        gameRef.current.resizeHandler = handleResize;

        // Start animation loop
        animate();
        setIsLoading(false);
<<<<<<< HEAD
        toast.success("Welcome to Neon City!");
=======
        toast.success("Round 1 of 5 - Survive 5 minutes to win!");
>>>>>>> 345dd89 (Auto-commit: Agent tool execution)

      } catch (error) {
        console.error("Error initializing NeonCity:", error);
        toast.error("Failed to load world. Please try again.");
        setIsLoading(false);
      }
    };

    initScene();

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
    };
  }, [setLocation]);

  // Format timer display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        backgroundColor: "#0a0a0a",
      }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#00ff00",
            fontSize: "24px",
            fontFamily: "monospace",
            zIndex: 1000,
            textAlign: "center",
          }}
        >
          <div>Initializing Neon City...</div>
          <div style={{ fontSize: "16px", marginTop: "10px", opacity: 0.7 }}>
            Generating Cyberpunk World...
          </div>
        </div>
      )}

      {/* Multiplayer player count indicator */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          backgroundColor: "rgba(0, 255, 0, 0.2)",
          color: "#00ff00",
          padding: "12px 20px",
          borderRadius: "8px",
          fontSize: "18px",
          fontFamily: "monospace",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "2px solid #00ff00",
          zIndex: 100,
<<<<<<< HEAD
        }}
      >
        <span style={{ fontSize: "24px" }}>👥</span>
        <span>{playerCount + 1} Player{playerCount !== 0 ? 's' : ''} Online</span>
=======
          minWidth: "220px"
        }}
      >
        <div style={{ fontSize: "22px", borderBottom: "1px solid #00ff00", paddingBottom: "8px" }}>
          🏃 ROUND {currentRound}/{maxRounds}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>⏱️ Time:</span>
          <span style={{
            color: roundTimer < 60 ? '#ff0000' : '#00ff00',
            fontWeight: 'bold'
          }}>
            {formatTime(roundTimer)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Distance:</span>
          <span>{distanceTraveled.toFixed(1)}m</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Status:</span>
          <span style={{ 
            color: gameStatus === 'playing' ? '#00ff00' : gameStatus === 'escaped' ? '#00ffff' : '#ff0000',
            fontWeight: 'bold'
          }}>
            {gameStatus === 'playing' ? '⚡ RUNNING' : gameStatus === 'escaped' ? '✅ ESCAPED' : '💀 CAUGHT'}
          </span>
        </div>
        <div style={{ borderTop: "1px solid #00ff00", paddingTop: "8px", marginTop: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px" }}>
            <span>Your Wins:</span>
            <span style={{ color: '#00ffff' }}>{playerWins}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px" }}>
            <span>Hunter Wins:</span>
            <span style={{ color: '#ff0000' }}>{hunterWins}</span>
          </div>
        </div>
>>>>>>> 345dd89 (Auto-commit: Agent tool execution)
      </div>

      {/* Instructions overlay */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "#00ff00",
          padding: "20px",
          borderRadius: "10px",
          fontFamily: "monospace",
          border: "2px solid #00ff00",
          zIndex: 100,
        }}
      >
<<<<<<< HEAD
        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>NEON CITY - MULTIPLAYER</h2>
        <p style={{ margin: "5px 0" }}>📍 Procedurally Generated Cyberpunk City</p>
        <p style={{ margin: "5px 0" }}>🎮 Mouse: Rotate View</p>
        <p style={{ margin: "5px 0" }}>🖱️ Scroll: Zoom In/Out</p>
        <p style={{ margin: "5px 0" }}>👥 See other players exploring</p>
        <p style={{ margin: "15px 0 5px 0", fontSize: "14px", opacity: 0.7 }}>
          Explore the procedurally generated city
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px", opacity: 0.7 }}>
          Socket.io • Three.js • Multiplayer
=======
        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>NEON CITY - 5 ROUNDS!</h2>
        <p style={{ margin: "5px 0" }}>🎯 Survive 5 minutes to win each round</p>
        <p style={{ margin: "5px 0" }}>👹 Advanced AI hunter with physics-based pursuit</p>
        <p style={{ margin: "5px 0" }}>🎮 W/A/S/D or Arrow Keys - Move</p>
        <p style={{ margin: "5px 0" }}>⚡ Shift - Sprint (run faster)</p>
        <p style={{ margin: "5px 0" }}>🏢 Use buildings as cover!</p>
        <p style={{ margin: "15px 0 5px 0", fontSize: "14px", opacity: 0.7 }}>
          Win 3+ rounds to win the game!
>>>>>>> 345dd89 (Auto-commit: Agent tool execution)
        </p>
      </div>

      {/* Game Over Overlay */}
      {isGameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            color: playerWins > hunterWins ? "#00ff00" : "#ff0000",
            padding: "40px 60px",
            borderRadius: "20px",
            fontFamily: "monospace",
            border: `4px solid ${playerWins > hunterWins ? "#00ff00" : "#ff0000"}`,
            zIndex: 200,
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: "0 0 20px 0", fontSize: "48px" }}>
            {playerWins > hunterWins ? "🏆 VICTORY!" : playerWins < hunterWins ? "💀 DEFEAT!" : "🤝 TIE!"}
          </h1>
          <p style={{ fontSize: "32px", margin: "10px 0" }}>
            Final Score: {playerWins} - {hunterWins}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "30px",
              padding: "15px 40px",
              backgroundColor: playerWins > hunterWins ? "#00ff00" : "#ff0000",
              color: "#000",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={() => setLocation("/home")}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "12px 24px",
          backgroundColor: "#00ff00",
          color: "#000",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          zIndex: 100,
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}
