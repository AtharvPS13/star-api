"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useRouter } from "next/navigation";

export default function StarSystemSimulation({ starData }) {
  const router = useRouter();
  const mountRef = useRef(null);

  useEffect(() => {
    let hovered = null;

    const container = mountRef.current;
    if (!container) return;

    // cleanup any previous canvases (HMR / Fast Refresh safe)
    while (container.firstChild) container.removeChild(container.lastChild);

    // --- SETUP ---
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    // pure black space background (you asked for black)
    scene.background = new THREE.Color(0x000000);
    scene.fog = null; // keep space pitch-black

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(0, 50, 90);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 300;
    controls.minDistance = 20;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0x333333, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 1.7, 1200, 2);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // subtle rim light for silhouettes
    const rim = new THREE.DirectionalLight(0x6666ff, 0.06);
    rim.position.set(80, 100, 50);
    scene.add(rim);

    // --- STARFIELD (many small white points) ---
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 3000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 3000;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.6, sizeAttenuation: true, transparent: true, opacity: 0.9 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // --- TEXTURE UTILS ---
    const textureCache = new Map();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    function getCachedTexture(key, gen) {
      if (textureCache.has(key)) return textureCache.get(key);
      const t = gen();
      t.anisotropy = maxAniso;
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      textureCache.set(key, t);
      return t;
    }

    function createProceduralTexture(type, colorHex) {
      // slightly larger texture so highlights read better on planets
      const w = 512;
      const h = 256;
      const key = `${type}_${colorHex}_${w}x${h}`;

      return getCachedTexture(key, () => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        const base = new THREE.Color(colorHex || 0x888888);
        ctx.fillStyle = `#${base.getHexString()}`;
        ctx.fillRect(0, 0, w, h);

        // add brighter highlights to make the planets pop
        if (type === "rocky" || type === "rocky_red") {
          // light speckles
          for (let i = 0; i < 600; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = Math.random() * 3 + 0.5;
            ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.07})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
          // deeper craters
          for (let i = 0; i < 60; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = Math.random() * 28 + 6;
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath();
            ctx.arc(x + r * 0.2, y + r * 0.2, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath();
            ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (type === "gas") {
          // horizontal bands (lighter + darker)
          for (let y = 0; y < h; y++) {
            const t = y / h;
            const band = Math.sin(t * Math.PI * 6 + Math.random() * 0.8) * 0.4 + 0.6;
            const r = Math.floor(base.r * 255 * (0.6 + band * 0.6));
            const g = Math.floor(base.g * 255 * (0.6 + band * 0.6));
            const b = Math.floor(base.b * 255 * (0.6 + band * 0.6));
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, y, w, 1);
          }
          // soft highlights
          ctx.globalAlpha = 0.12;
          for (let i = 0; i < 400; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const rx = Math.random() * 90 + 20;
            const ry = Math.random() * 8 + 2;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (type === "star") {
          // bright center + flares (kept subtle for star surface)
          const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, Math.min(w, h) / 1.6);
          g.addColorStop(0, "#fff9e6");
          g.addColorStop(0.15, `#${base.getHexString()}`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }

        // final subtle noise to avoid flat patches
        const id = ctx.getImageData(0, 0, w, h);
        for (let i = 0; i < id.data.length; i += 4) {
          const n = (Math.random() - 0.5) * 20;
          id.data[i] = Math.max(0, Math.min(255, id.data[i] + n));
          id.data[i + 1] = Math.max(0, Math.min(255, id.data[i + 1] + n));
          id.data[i + 2] = Math.max(0, Math.min(255, id.data[i + 2] + n));
        }
        ctx.putImageData(id, 0, 0);

        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
      });
    }

    // little sprite glow for the star (keeps the 'weird' glow effect you liked)
    function makeSunSprite(radius) {
      const size = 512;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(255, 245, 200, 1)");
      grad.addColorStop(0.35, "rgba(255,180,80,0.5)");
      grad.addColorStop(0.7, "rgba(255,120,40,0.18)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(radius * 6, radius * 6, 1);
      sprite.renderOrder = 999;
      return { sprite, tex, mat };
    }

    // --- DATA MAPPING ---
    const systemData = [
      {
        name: starData.name || "Star",
        type: "Star",
        radius: 8,
        distance: 0,
        speed: 0,
        color: 0xffaa00,
        textureType: "star",
      },
      ...(starData.planets || []).map((planet, index) => ({
        name: planet.name,
        planet_id: planet.planet_id,
        type: "Planet",
        radius: Math.max(0.8, planet.radius || Math.random() * 2 + 1),
        distance: 25 + index * 15,
        speed: 0.0008 / (index * 0.5 + 1),
        color: planet.color || Math.random() * 0xffffff,
        textureType: planet.textureType || (index % 2 === 0 ? "rocky" : "gas"),
        angle: Math.random() * Math.PI * 2,
      })),
    ];

    const celestialObjects = [];
    const disposeList = [];
    const labels = [];

    systemData.forEach((data) => {
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const texture = createProceduralTexture(data.textureType, data.color);

      let material;
      if (data.type === "Star") {
        material = new THREE.MeshBasicMaterial({ map: texture });
      } else {
        // boost brightness with a small emissive tint and slightly lower roughness so highlights read better
        material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.55,
          metalness: 0.02,
          emissive: new THREE.Color(data.color).multiplyScalar(0.06),
          emissiveIntensity: 1.0,
        });
      }

      disposeList.push(geometry, material, texture);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { ...data, currentAngle: data.angle || 0 };

      // label
      const labelDiv = document.createElement("div");
      labelDiv.className = "absolute text-xs text-white bg-black/60 px-2 py-1 rounded pointer-events-none select-none whitespace-nowrap z-10";
      labelDiv.style.display = "none";
      labelDiv.textContent = data.name;
      container.appendChild(labelDiv);
      labels.push({ div: labelDiv, mesh, offset: data.radius + 2 });

      if (data.distance === 0) {
        mesh.position.set(0, 0, 0);
        scene.add(mesh);

        // keep a subtle sprite glow for the star
        const { sprite, tex, mat } = makeSunSprite(data.radius);
        sprite.position.set(0, 0, 0);
        scene.add(sprite);
        disposeList.push(tex, mat, sprite);

      } else {
        const orbitGeo = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
        const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.06 });
        const orbit = new THREE.Mesh(orbitGeo, orbitMat);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
        disposeList.push(orbitGeo, orbitMat);

        mesh.position.x = Math.cos(mesh.userData.currentAngle) * data.distance;
        mesh.position.z = Math.sin(mesh.userData.currentAngle) * data.distance;
        scene.add(mesh);
        celestialObjects.push(mesh);
      }
    });

    // --- RAYCASTING / INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onPointerMove(event) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onClick(event) {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(celestialObjects);
      if (hits.length > 0) {
        const obj = hits[0].object;
        const planetId = obj.userData.planet_id;
        if (planetId) router.push(`/planets/${planetId}`);
      }
    }

    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("click", onClick);

    // --- ANIMATION ---
    let reqId;
    const tmpV = new THREE.Vector3();

    function animate() {
      reqId = requestAnimationFrame(animate);

      celestialObjects.forEach((obj) => {
        const d = obj.userData;
        d.currentAngle += d.speed;
        obj.position.x = Math.cos(d.currentAngle) * d.distance;
        obj.position.z = Math.sin(d.currentAngle) * d.distance;
        obj.rotation.y += 0.01;
      });

      // hover detection and cursor
      raycaster.setFromCamera(mouse, camera);
      const hoverHits = raycaster.intersectObjects(celestialObjects);
      if (hoverHits.length > 0) {
        if (!hovered) {
          hovered = hoverHits[0].object;
          container.style.cursor = "pointer";
        }
      } else {
        if (hovered) {
          hovered = null;
          container.style.cursor = "default";
        }
      }

      // labels positioned using current container size
      labels.forEach(({ div, mesh, offset }) => {
        tmpV.copy(mesh.position);
        tmpV.y += offset;
        tmpV.project(camera);

        const isVisible = tmpV.z < 1 && tmpV.x >= -1 && tmpV.x <= 1 && tmpV.y >= -1 && tmpV.y <= 1;
        if (isVisible) {
          const x = (tmpV.x * 0.5 + 0.5) * container.clientWidth;
          const y = (-(tmpV.y * 0.5) + 0.5) * container.clientHeight;
          div.style.display = "block";
          div.style.transform = `translate(-50%, -50%)`;
          div.style.left = `${x}px`;
          div.style.top = `${y}px`;
        } else {
          div.style.display = "none";
        }
      });

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // --- RESIZE ---
    function handleResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    // --- CLEANUP ---
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(reqId);
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("click", onClick);

      // dispose three resources safely
      disposeList.forEach((it) => {
        try {
          if (it && typeof it.dispose === "function") it.dispose();
        } catch (e) {}
      });

      textureCache.forEach((t) => { try { t.dispose(); } catch (e) {} });

      try { starGeo.dispose(); } catch (e) {}
      try { starMat.dispose(); } catch (e) {}

      controls.dispose();
      renderer.forceContextLoss();
      renderer.dispose();

      while (container.firstChild) container.removeChild(container.lastChild);
    };
  }, [starData, router]);

  return (
    <div ref={mountRef} className="w-full h-full relative">
      <div className="absolute bottom-2 left-2 text-[10px] text-gray-400 pointer-events-none select-none z-0">
        Drag to Rotate • Scroll to Zoom
      </div>
    </div>
  );
}
