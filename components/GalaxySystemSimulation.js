"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function GalaxySystemSimulation({ galaxyData }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    while (container.firstChild) container.removeChild(container.lastChild);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
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

    let geometry = null;
    let material = null;
    let points = null;

    const typeStr = (galaxyData.type || "").toLowerCase();
    const isSpiral = typeStr.includes("spiral");

    const colorInside = new THREE.Color(0xff6030);
    const colorOutside = new THREE.Color(0x1b3984);
    
    const irregularColors = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xaaccff),
        new THREE.Color(0xffccaa),
        new THREE.Color(0xffaaaa),
    ];

    if (isSpiral) {
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
            const r = Math.random() * parameters.radius; 
            
            const spinAngle = r * parameters.spin;
            
            const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * r;

            const x = Math.cos(spinAngle + branchAngle) * r + randomX;
            const y = (randomY * 2) / 4; // Flatten the galaxy on Y axis
            const z = Math.sin(spinAngle + branchAngle) * r + randomZ;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, r / parameters.radius);
            
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    } else {
        const count = 8000;
        geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for(let i=0; i<count; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            
            const r = 12 * Math.pow(Math.random(), 0.5);

            let x = r * Math.sin(phi) * Math.cos(theta);
            let y = r * Math.sin(phi) * Math.sin(theta) * 0.6;
            let z = r * Math.cos(phi);

            if (Math.random() > 0.5) {
                x += (Math.random() - 0.5) * 8;
                z += (Math.random() - 0.5) * 8;
            }

            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;

            const c = irregularColors[Math.floor(Math.random() * irregularColors.length)];
            colors[i*3] = c.r;
            colors[i*3+1] = c.g;
            colors[i*3+2] = c.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    material = new THREE.PointsMaterial({
        size: 0.15,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);

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

    let reqId;
    function animate() {
        reqId = requestAnimationFrame(animate);
        
        if (points) {
            points.rotation.y += 0.001;
            points.rotation.z = 0.1;
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

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