"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function GalaxySystemSimulation({ galaxyData }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // cleanup previous
    while (container.firstChild) container.removeChild(container.lastChild);

    // --- SETUP ---
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    // Deep space dark purple/black background
    scene.background = new THREE.Color(0x020207); 
    scene.fog = new THREE.FogExp2(0x020207, 0.002);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 15, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.maxDistance = 60;
    controls.minDistance = 5;

    // --- GALAXY GENERATION ---
    let geometry = null;
    let material = null;
    let points = null;

    const typeStr = (galaxyData.type || "").toLowerCase();
    const isSpiral = typeStr.includes("spiral");

    // Helper: Color Interpolation
    const colorInside = new THREE.Color(0xff6030); // Orange/Red core
    const colorOutside = new THREE.Color(0x1b3984); // Blue arms
    
    // Irregular colors
    const irregularColors = [
        new THREE.Color(0xffffff), // White
        new THREE.Color(0xaaccff), // Blue-ish
        new THREE.Color(0xffccaa), // Yellow-ish
        new THREE.Color(0xffaaaa), // Pink-ish
    ];

    if (isSpiral) {
        // --- SPIRAL GALAXY PARAMETERS ---
        const parameters = {
            count: 20000,
            size: 15,
            radius: 10,
            branches: 3, 
            spin: 1, 
            randomness: 0.2,
            randomnessPower: 3,
            coreSize: 0.15 
        };

        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3);

        for (let i = 0; i < parameters.count; i++) {
            // Radius from center
            // We use Math.random() to distribute, but squash it slightly to have denser core
            const r = Math.random() * parameters.radius; 
            
            // Spin angle: Further out stars spin more relative to the arm
            const spinAngle = r * parameters.spin;
            
            // Branch angle: 0, 120, 240 degrees etc.
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

            // Randomness to spread stars from the perfect line
            // Power function pushes values closer to 0, making a tight arm with some scatter
            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;

            const x = Math.cos(spinAngle + branchAngle) * r + randomX;
            const y = (randomY * 2) / 4; // Flatten the galaxy on Y axis
            const z = Math.sin(spinAngle + branchAngle) * r + randomZ;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Color mixing
            // Core is reddish, Outer is bluish
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, r / parameters.radius);
            
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    } else {
        // --- IRREGULAR GALAXY PARAMETERS ---
        const count = 8000;
        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for(let i=0; i<count; i++) {
            // Random point in a sphere, but squashed slightly
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            
            // Varying density (dense clusters + loose stars)
            const r = 12 * Math.pow(Math.random(), 0.5); // Spread out

            // Irregular shape deformation (noise-like)
            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = r * Math.sin(phi) * Math.sin(theta) * 0.6; // Flattened
            let z = r * Math.cos(phi);

            // Add some "blobs" or offsets to make it look non-spherical
            if (Math.random() > 0.5) {
                x += (Math.random() - 0.5) * 8;
                z += (Math.random() - 0.5) * 8;
            }

            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;

            // Random colors from the palette
            const c = irregularColors[Math.floor(Math.random() * irregularColors.length)];
            colors[i*3] = c.r;
            colors[i*3+1] = c.g;
            colors[i*3+2] = c.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    // --- MATERIAL ---
    // Using PointsMaterial with AdditiveBlending makes overlapping stars glow
    material = new THREE.PointsMaterial({
        size: 0.15,
        sizeAttenuation: true,
        depthWrite: false, // Important for transparency/glow
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- BACKGROUND STARS (Optional, for depth) ---
    const bgGeo = new THREE.BufferGeometry();
    const bgCount = 1000;
    const bgPos = new Float32Array(bgCount * 3);
    for(let i=0; i<bgCount*3; i++) {
        bgPos[i] = (Math.random() - 0.5) * 400;
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({ color: 0x444444, size: 0.5, transparent: true, opacity: 0.5 });
    const bgStars = new THREE.Points(bgGeo, bgMat);
    scene.add(bgStars);


    // --- ANIMATION ---
    let reqId;
    function animate() {
        reqId = requestAnimationFrame(animate);
        
        // Rotate the galaxy slowly
        if (points) {
            points.rotation.y += 0.001;
            // Slight tilt for aesthetics
            points.rotation.z = 0.1;
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // --- HANDLE RESIZE ---
    function handleResize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(reqId);
        
        if (geometry) geometry.dispose();
        if (material) material.dispose();
        if (bgGeo) bgGeo.dispose();
        if (bgMat) bgMat.dispose();
        renderer.dispose();
        controls.dispose();
    };

  }, [galaxyData]);

  return <div ref={mountRef} className="w-full h-full bg-black" />;
}