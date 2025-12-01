// components/ConstellationSystemSimulation.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Link from "next/link";

export default function ConstellationSystemSimulation({ stars }) {
  const containerRef = useRef(null);
  const [selectedStar, setSelectedStar] = useState(null);
  
  // We remove isHovering state to prevent re-renders of the whole component
  // which can reset the canvas. We'll handle cursor style directly in JS.

  const sizeRef = useRef({ width: 0, height: 0 });
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const reqIdRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !stars || stars.length === 0) return;

    // --- INIT VARIABLES ---
    const disposables = [];
    const starMeshes = [];
    const labels = [];
    const starPositions = [];
    
    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505'); 
    scene.fog = new THREE.FogExp2(0x050505, 0.002);
    sceneRef.current = scene;

    // Camera (Defaults, will be updated by ResizeObserver)
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.set(0, 0, 140);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.style.position = 'relative'; 
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.maxDistance = 300;
    controls.minDistance = 20;

    // --- ASSETS ---
    const getGlowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32; canvas.height = 32;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(canvas);
    };
    const glowTexture = getGlowTexture();
    disposables.push(glowTexture);

    const getStarColor = (type) => {
      if (!type) return 0xffffff;
      const t = type.charAt(0).toUpperCase();
      if (t === 'O') return 0x9bb0ff;
      if (t === 'B') return 0xaaddff;
      if (t === 'A') return 0xcad7ff;
      if (t === 'F') return 0xf8f7ff;
      if (t === 'G') return 0xfff4ea;
      if (t === 'K') return 0xffd2a1;
      if (t === 'M') return 0xffcc6f;
      return 0xffffff;
    };

    // --- NORMALIZATION LOGIC ---
    const distances = stars.map(s => s.distance || 1);
    const minDist = Math.min(...distances);
    const maxDist = Math.max(...distances);
    const SCENE_MIN_R = 30;
    const SCENE_MAX_R = 90;

    // --- BUILD OBJECTS ---
    stars.forEach((star) => {
      let r = SCENE_MIN_R; 
      if (maxDist !== minDist) {
        const normalized = ((star.distance || 1) - minDist) / (maxDist - minDist);
        r = SCENE_MIN_R + (normalized * (SCENE_MAX_R - SCENE_MIN_R));
      } else {
        r = 50;
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(phi);
      const z = r * Math.cos(theta) * Math.cos(phi);
      const pos = new THREE.Vector3(x, y, z);
      starPositions.push(pos);

      // Mesh
      const color = getStarColor(star.star_type);
      const geometry = new THREE.SphereGeometry(1.5, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pos);
      mesh.userData = { ...star };
      
      scene.add(mesh);
      starMeshes.push(mesh);
      disposables.push(geometry, material);

      // Glow Sprite
      const spriteMat = new THREE.SpriteMaterial({ 
        map: glowTexture, 
        color: color, 
        transparent: true, 
        opacity: 0.8, 
        blending: THREE.AdditiveBlending 
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(8, 8, 1);
      mesh.add(sprite);
      sprite.userData = { ...star };
      disposables.push(spriteMat);

      // Label
      const labelDiv = document.createElement("div");
      labelDiv.className = "absolute top-0 left-0 text-[11px] font-mono text-cyan-200 bg-gray-900/60 border border-gray-700/50 px-2 py-0.5 rounded pointer-events-none select-none z-10 whitespace-nowrap backdrop-blur-[2px]";
      labelDiv.textContent = star.name;
      labelDiv.style.display = 'none';
      containerRef.current.appendChild(labelDiv);
      labels.push({ div: labelDiv, mesh: mesh });
    });

    // Lines
    if (starPositions.length > 1) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(starPositions);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.15 
      });
      const constellationLines = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(constellationLines);
      disposables.push(lineGeometry, lineMaterial);
    }

    // --- INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    raycaster.params.Points.threshold = 5;

    const handleMouseMove = (event) => {
      // Safety check if renderer or container is gone
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(starMeshes, true);

      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(starMeshes, true);
      if (intersects.length > 0) {
        setSelectedStar(intersects[0].object.userData);
      } else {
        setSelectedStar(null);
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);


    // --- RESIZE OBSERVER (FIX FOR FREEZING) ---
    // Instead of relying on window 'resize', we watch the container div directly.
    // This triggers when the div first gets its layout dimensions.
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        
        // Prevent 0 size errors
        if (width === 0 || height === 0) return;

        sizeRef.current = { width, height };
        
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);

    // --- ANIMATION LOOP ---
    const tempV = new THREE.Vector3();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      controls.update();

      const { width, height } = sizeRef.current;
      
      // Don't render if size is invalid
      if (width === 0 || height === 0) return;

      const halfWidth = width / 2;
      const halfHeight = height / 2;

      labels.forEach(({ div, mesh }) => {
        mesh.getWorldPosition(tempV);
        tempV.project(camera);

        if (tempV.z < 1 && tempV.z > -1 && Math.abs(tempV.x) < 1.1 && Math.abs(tempV.y) < 1.1) {
           const x = (tempV.x * halfWidth) + halfWidth;
           const y = -(tempV.y * halfHeight) + halfHeight;
           div.style.display = 'block';
           div.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -30px)`;
           div.style.opacity = Math.max(0.4, 1 - (tempV.z * 0.5)); 
        } else {
           div.style.display = 'none';
        }
      });

      renderer.render(scene, camera);
    };
    
    animate();

    // --- CLEANUP ---
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; 
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
      }
      disposables.forEach(obj => obj.dispose());
      renderer.dispose();
      // Reset cursor
      document.body.style.cursor = 'default';
    };
  }, [stars]);

  return (
    <div className="relative w-full h-full group">
      <div ref={containerRef} className="w-full h-full relative overflow-hidden" />

      {/* Selected Star Popup */}
      {selectedStar && (
        <div className="absolute top-4 right-4 w-64 bg-gray-900/90 backdrop-blur border border-purple-500/50 rounded-lg p-5 text-white z-20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <button 
            onClick={() => setSelectedStar(null)} 
            className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
          >
            ✕
          </button>
          
          <h3 className="font-bold text-xl text-purple-300 mb-2">
            {selectedStar.name || "Unknown Star"}
          </h3>
          
          <div className="space-y-1 text-sm text-gray-300 mb-4">
            <div className="flex justify-between border-b border-gray-700 pb-1">
                <span>Type</span>
                <span className="text-white font-mono">{selectedStar.star_type || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-1 pt-1">
                <span>Dist</span>
                <span className="text-white font-mono">{selectedStar.distance || "?"} ly</span>
            </div>
          </div>
          
          {selectedStar.id && (
            <Link 
              href={`/stars/${selectedStar.id}`}
              target="_blank"
              className="block w-full text-center bg-purple-700 hover:bg-purple-600 text-sm font-medium py-2 rounded transition-colors"
            >
              View Star Profile
            </Link>
          )}
        </div>
      )}
    </div>
  );
}