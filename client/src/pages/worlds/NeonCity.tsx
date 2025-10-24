import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import * as THREE from "three";
import { ProceduralCityGenerator } from "../../worlds/neon-city/proceduralCityGenerator";
import { PlayerController } from "../../worlds/neon-city/PlayerController";
import { NPCHunter } from "../../worlds/neon-city/NPCHunter";


export default function NeonCity() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    animationId?: number;
    resizeHandler?: () => void;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    player?: PlayerController;
    hunter?: NPCHunter;
    buildings?: THREE.Mesh[];
    roundStartTime?: number;
    currentRoundTime?: number;
    }>({});

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to play");
      setLocation("/");
      return;
    }

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
        scene.fog = new THREE.Fog(0x0a0a0a, 30, 100);
        gameRef.current.scene = scene;

        // Camera setup (third-person view)
        const camera = new THREE.PerspectiveCamera(
          60,
          window.innerWidth / window.innerHeight,
          0.1,
          500
        );
        camera.position.set(0, 8, 12); // Initial camera position behind and above spawn
        gameRef.current.camera = camera;

        // Generate procedural neon city with buildings
        console.log('🌆 Generating Neon City...');
        const cityGenerator = new ProceduralCityGenerator(scene);
        cityGenerator.generate();
        const buildings = cityGenerator.getBuildings();
        gameRef.current.buildings = buildings;
        console.log('✅ Neon City generated');

        // Create player at spawn (0, 0, 0)
        const player = new PlayerController(scene, new THREE.Vector3(0, 0, 0));
        gameRef.current.player = player;

        // Create NPC hunter starting far away
        const hunter = new NPCHunter(scene, new THREE.Vector3(40, 0, 40));
        gameRef.current.hunter = hunter;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

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

          if (roundInProgress && player.isAlive && buildings && !isGameOver) {
            // Update round timer
            gameRef.current.currentRoundTime = (currentTime - (gameRef.current.roundStartTime || currentTime)) / 1000;
            const timeRemaining = Math.max(0, 300 - gameRef.current.currentRoundTime);
            setRoundTimer(timeRemaining);
            
            // Check if time expired (player wins round)
            if (timeRemaining <= 0) {
              endRound(true);
            }
            
            // Update player (no camera parameter needed now)
            player.update(dt, buildings);

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
            }

            // Update distance display
            setDistanceTraveled(player.distanceTraveled);

            // Intelligent third-person camera positioning
            const playerPos = player.getPosition();
            
            // Camera offset: behind and above the player
            const cameraDistance = 12; // Distance behind player
            const cameraHeight = 8;    // Height above player
            
            // Calculate camera position based on player's facing direction
            const playerRotation = player.mesh.rotation.y;
            const cameraOffsetX = Math.sin(playerRotation) * cameraDistance;
            const cameraOffsetZ = Math.cos(playerRotation) * cameraDistance;
            
            // Target camera position (behind player)
            const targetCameraPos = new THREE.Vector3(
              playerPos.x + cameraOffsetX,
              playerPos.y + cameraHeight,
              playerPos.z + cameraOffsetZ
            );
            
            // Smooth camera follow with physics-based lerp
            const lerpFactor = 1 - Math.pow(0.001, dt); // Frame-rate independent lerp
            camera.position.lerp(targetCameraPos, lerpFactor);
            
            // Camera looks at point slightly ahead and above player
            const lookAtTarget = playerPos.clone();
            lookAtTarget.y += 1.5; // Look at upper body/head level
            camera.lookAt(lookAtTarget);
          }

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
        toast.success("Round 1 of 5 - Survive 5 minutes to win!");

      } catch (error) {
        console.error("Error initializing NeonCity:", error);
        toast.error("Failed to load world. Please try again.");
        setIsLoading(false);
      }
    };

    initScene();

    // Cleanup function
    return () => {
      // Dispose player
      if (gameRef.current.player) {
        gameRef.current.player.dispose();
      }

      // Dispose hunter
      if (gameRef.current.hunter) {
        gameRef.current.hunter.dispose();
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
            Loading Chase Game...
          </div>
        </div>
      )}

      {/* Game Stats HUD */}
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
          flexDirection: "column",
          gap: "8px",
          border: "2px solid #00ff00",
          zIndex: 100,
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
        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>NEON CITY - 5 ROUNDS!</h2>
        <p style={{ margin: "5px 0" }}>🎯 Survive 5 minutes to win each round</p>
        <p style={{ margin: "5px 0" }}>👹 Advanced AI hunter with physics-based pursuit</p>
        <p style={{ margin: "5px 0" }}>🎮 W/A/S/D or Arrow Keys - Move</p>
        <p style={{ margin: "5px 0" }}>⚡ Shift - Sprint (run faster)</p>
        <p style={{ margin: "5px 0" }}>🏢 Use buildings as cover!</p>
        <p style={{ margin: "15px 0 5px 0", fontSize: "14px", opacity: 0.7 }}>
          Win 3+ rounds to win the game!
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
