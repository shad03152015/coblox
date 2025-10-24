import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function NeonCity() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    animationId?: number;
    resizeHandler?: () => void;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: OrbitControls;
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

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        scene.add(directionalLight);

        // Add grid helper
        const gridHelper = new THREE.GridHelper(200, 50, 0x00ff00, 0x003300);
        scene.add(gridHelper);

        // Add placeholder geometry - will be replaced with Minecraft world data
        const geometry = new THREE.BoxGeometry(10, 10, 10);
        const material = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          emissive: 0x003300,
          wireframe: true,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 5, 0);
        scene.add(cube);

        // Add text sprite for "Loading Minecraft World"
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = 512;
          canvas.height = 256;
          context.fillStyle = '#00ff00';
          context.font = 'Bold 48px Arial';
          context.fillText('NEON CITY', 50, 100);
          context.font = '32px Arial';
          context.fillText('Minecraft World Viewer', 50, 150);
          context.fillText('(Coming Soon)', 50, 190);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(0, 20, 0);
        sprite.scale.set(40, 20, 1);
        scene.add(sprite);

        // Animation loop
        function animate() {
          const animationId = requestAnimationFrame(animate);
          gameRef.current.animationId = animationId;

          // Rotate cube
          cube.rotation.x += 0.005;
          cube.rotation.y += 0.005;

          controls.update();
          renderer.render(scene, camera);
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
        toast.success("Scene loaded - Minecraft world viewer in development");

      } catch (error) {
        console.error("Error initializing NeonCity:", error);
        toast.error("Failed to load world. Please try again.");
        setIsLoading(false);
      }
    };

    initScene();

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
          }}
        >
          Loading Neon City...
        </div>
      )}

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
        <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>NEON CITY</h2>
        <p style={{ margin: "5px 0" }}>📍 Minecraft 1.16.5 World</p>
        <p style={{ margin: "5px 0" }}>🎮 Mouse: Rotate View</p>
        <p style={{ margin: "5px 0" }}>🖱️ Scroll: Zoom In/Out</p>
        <p style={{ margin: "15px 0 5px 0", fontSize: "14px", opacity: 0.7 }}>
          Full Minecraft world loading coming soon...
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px", opacity: 0.7 }}>
          Libraries: prismarine-nbt, prismarine-chunk, Three.js
        </p>
      </div>

      {/* Back button */}
      <button
        onClick={() => setLocation("/home")}
        style={{
          position: "absolute",
          top: "20px",
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
