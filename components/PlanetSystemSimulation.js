"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function PlanetSystemSimulation({ planetData = {} }) {
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
    scene.background = new THREE.Color(0x050505);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 12;
    controls.maxDistance = 40;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x404040, 0.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(50, 20, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const rimLight = new THREE.SpotLight(0x4455ff, 1.2);
    rimLight.position.set(-50, 50, -10);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // --- STARS BACKGROUND ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 400;
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.85 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- RANDOM / SEEDED RNG ---
    function makeRNG(seed) {
      if (seed == null) return () => Math.random();
      // simple LCG for deterministic variations if seed provided
      let s = typeof seed === 'number' ? seed >>> 0 : hashString(seed);
      return () => {
        s = (1664525 * s + 1013904223) >>> 0;
        return (s & 0xfffffff) / 0x10000000;
      };
    }
    function hashString(str) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
      return h;
    }

    const rng = makeRNG(planetData.seed ?? undefined);

    // --- COLOR HELPERS ---
    function mixColors(hexA, hexB, t) {
      const a = new THREE.Color(hexA);
      const b = new THREE.Color(hexB);
      return a.lerp(b, t);
    }
    function randomPalette(baseHex) {
      // return 2-4 complementary variations around the base color
      const base = new THREE.Color(baseHex || 0x8b4513);
      const palette = [base.clone()];
      for (let i = 0; i < 3; i++) {
        const hShift = (rng() - 0.5) * 0.12; // small hue shifts
        const sShift = (rng() - 0.5) * 0.2;
        const lShift = (rng() - 0.5) * 0.18;
        const temp = base.clone().offsetHSL(hShift, sShift, lShift);
        palette.push(temp);
      }
      return palette;
    }

    // --- NOISE/PATCH GENERATORS ---
    function splatNoise(ctx, w, h, count, minR, maxR, fillStyleFunc) {
      for (let i = 0; i < count; i++) {
        const x = rng() * w;
        const y = rng() * h;
        const r = minR + rng() * (maxR - minR);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = fillStyleFunc ? fillStyleFunc(x, y, r, i) : `rgba(0,0,0,0.1)`;
        ctx.fill();
      }
    }

    // Simple blit/box blur for small smoothing
    function blurCanvas(srcCanvas, radius = 2) {
      if (radius <= 0) return srcCanvas;
      const w = srcCanvas.width, h = srcCanvas.height;
      const ctx = srcCanvas.getContext('2d');
      // use canvas filter if available (faster)
      try {
        ctx.filter = `blur(${radius}px)`;
        const tmp = document.createElement('canvas');
        tmp.width = w; tmp.height = h;
        const tctx = tmp.getContext('2d');
        tctx.filter = ctx.filter;
        tctx.drawImage(srcCanvas, 0, 0);
        ctx.filter = 'none';
        return tmp;
      } catch (e) {
        // fallback: return original
        return srcCanvas;
      }
    }

    // Generate a normal map from grayscale height map
    function generateNormalMap(heightCanvas, strength = 1.0) {
      const w = heightCanvas.width, h = heightCanvas.height;
      const hctx = heightCanvas.getContext('2d');
      const hdata = hctx.getImageData(0, 0, w, h).data;
      const nCanvas = document.createElement('canvas');
      nCanvas.width = w; nCanvas.height = h;
      const nctx = nCanvas.getContext('2d');
      const nImg = nctx.createImageData(w, h);

      function lum(i) { return hdata[i] / 255; }
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const left = (y * w + (x - 1 + w) % w) * 4;
          const right = (y * w + (x + 1) % w) * 4;
          const up = (((y - 1 + h) % h) * w + x) * 4;
          const down = (((y + 1) % h) * w + x) * 4;
          const dx = (lum(right) - lum(left)) * strength;
          const dy = (lum(down) - lum(up)) * strength;
          // normal vector
          const nz = 1.0 / Math.sqrt(dx * dx + dy * dy + 1);
          const nx = dx * nz;
          const ny = dy * nz;
          // encode to RGB
          nImg.data[i] = Math.floor((nx * 0.5 + 0.5) * 255);
          nImg.data[i + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
          nImg.data[i + 2] = Math.floor((nz) * 255);
          nImg.data[i + 3] = 255;
        }
      }
      nctx.putImageData(nImg, 0, 0);
      return nCanvas;
    }

    // --- TEXTURE: GAS GIANT ---
    function createGasGiantTexture(baseColorHex) {
      const size = 2048; // higher resolution for smoother bands
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');

      const palette = randomPalette(baseColorHex || 0xcc9966);

      // Background radial gradient to add slight vignetting
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      const c0 = palette[0].clone().offsetHSL((rng()-0.5)*0.02, 0.02, -0.02);
      grad.addColorStop(0, `#${c0.getHexString()}`);
      const c1 = palette[Math.floor(rng()*palette.length)].clone().offsetHSL((rng()-0.5)*0.05, 0, 0.05);
      grad.addColorStop(1, `#${c1.getHexString()}`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Bands: many layered thin gradients with turbulence
      const bandCount = 8 + Math.floor(rng() * 14);
      for (let i = 0; i < bandCount; i++) {
        const y = (i / bandCount) * size;
        const h = (size / bandCount) * (0.5 + rng() * 1.8);

        // choose color between palette choices with a bit of randomness
        const colA = palette[Math.floor(rng() * palette.length)];
        const colB = palette[Math.floor(rng() * palette.length)];
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, `#${colA.clone().offsetHSL((rng()-0.5)*0.06, (rng()-0.5)*0.1, (rng()-0.5)*0.06).getHexString()}`);
        g.addColorStop(1, `#${colB.clone().offsetHSL((rng()-0.5)*0.06, (rng()-0.5)*0.1, (rng()-0.5)*0.06).getHexString()}`);

        // draw wave path for band with horizontal sinusoidal distortion
        ctx.beginPath();
        const amplitude = 8 + rng() * 28;
        const freq = 0.002 + rng() * 0.01;
        for (let x = 0; x <= size; x += 2) {
          const distortion = Math.sin(x * freq + i * 0.4 + rng()*2) * amplitude * Math.sin(i*0.15);
          const yy = y + distortion;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.lineTo(size, y + h);
        ctx.lineTo(0, y + h);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();

        // subtle thin streaks per band
        ctx.beginPath();
        for (let x = 0; x <= size; x += 8) {
          const distortion = Math.sin(x * (freq*1.5) + i) * (amplitude*0.25);
          const yy = y + distortion + h * (0.1 + rng()*0.8);
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.02 + rng()*0.06})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Storms & spots (contrast spots)
      const storms = 1 + Math.floor(rng()*5);
      for (let s = 0; s < storms; s++) {
        const x = rng() * size;
        const y = rng() * size;
        const rx = 40 + rng() * 220;
        const ry = 20 + rng() * 100;
        const gradS = ctx.createRadialGradient(x, y, 0, x, y, rx);
        gradS.addColorStop(0, `rgba(255,255,255,${0.12 + rng()*0.22})`);
        gradS.addColorStop(0.6, `rgba(0,0,0,${0.06 + rng()*0.12})`);
        gradS.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = gradS;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, rng()*Math.PI, 0, Math.PI*2);
        ctx.fill();
      }

      // Grain / final noise
      const img = ctx.getImageData(0, 0, size, size);
      for (let i = 0; i < img.data.length; i += 4) {
        const noise = (rng() - 0.5) * 18;
        img.data[i] = Math.max(0, Math.min(255, img.data[i] + noise));
        img.data[i+1] = Math.max(0, Math.min(255, img.data[i+1] + noise));
        img.data[i+2] = Math.max(0, Math.min(255, img.data[i+2] + noise));
      }
      ctx.putImageData(img, 0, 0);

      // Roughness map (lighter = rougher)
      const roughCanvas = document.createElement('canvas');
      roughCanvas.width = roughCanvas.height = size;
      const rctx = roughCanvas.getContext('2d');
      // base roughness
      rctx.fillStyle = '#b0b0b0';
      rctx.fillRect(0,0,size,size);
      // add streaky gloss lines
      for (let i = 0; i < 400; i++) {
        const y = rng()*size;
        const grad = rctx.createLinearGradient(0, y, size, y+1);
        const gVal = Math.floor(80 + rng()*120);
        grad.addColorStop(0, `rgba(${gVal},${gVal},${gVal},${0.03 + rng()*0.07})`);
        grad.addColorStop(1, `rgba(${gVal+10},${gVal+10},${gVal+10},0)`);
        rctx.fillStyle = grad;
        rctx.fillRect(0, y, size, 1);
      }
      // add local shiny spots where storms are
      for (let s = 0; s < storms; s++) {
        const x = rng()*size; const y = rng()*size;
        rctx.beginPath();
        rctx.fillStyle = 'rgba(40,40,40,0.3)';
        rctx.arc(x,y, 40 + rng()*180, 0, Math.PI*2);
        rctx.fill();
      }

      const normalCanvas = generateNormalMap(canvas, 2.0);

      const map = new THREE.CanvasTexture(canvas);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(1,1);
      const rough = new THREE.CanvasTexture(roughCanvas);
      rough.wrapS = rough.wrapT = THREE.RepeatWrapping;
      const normal = new THREE.CanvasTexture(normalCanvas);
      normal.wrapS = normal.wrapT = THREE.RepeatWrapping;

      return { map, roughnessMap: rough, normalMap: normal, roughness: 0.45, metalness: 0.05 };
    }

    // --- TEXTURE: ROCKY PLANET ---
    function createRockyTexture(baseColorHex) {
      const size = 2048;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');

      const palette = randomPalette(baseColorHex || 0x8b4513);

      // Base color + subtle gradient
      const base = palette[0].clone().offsetHSL((rng()-0.5)*0.02, (rng()-0.5)*0.05, (rng()-0.5)*0.04);
      const top = palette[Math.floor(rng()*palette.length)].clone().offsetHSL(0.02, -0.04, 0.06);
      const g = ctx.createLinearGradient(0,0,0,size);
      g.addColorStop(0, `#${top.getHexString()}`);
      g.addColorStop(1, `#${base.getHexString()}`);
      ctx.fillStyle = g;
      ctx.fillRect(0,0,size,size);

      // Large continent blobs using splats
      splatNoise(ctx, size, size, 1200 + Math.floor(rng()*2000), 6, 120, (x,y,r,i) => {
        const shade = (rng()-0.5) * 0.12;
        const c = palette[Math.floor(rng()*palette.length)].clone().offsetHSL((rng()-0.5)*0.1, (rng()-0.5)*0.2, shade);
        return `rgba(${Math.floor(c.r*255)}, ${Math.floor(c.g*255)}, ${Math.floor(c.b*255)}, ${0.08 + rng()*0.22})`;
      });

      // Craters: darker rings with highlights
      for (let i = 0; i < 120; i++) {
        const x = rng()*size; const y = rng()*size; const r = 6 + rng()*60;
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,0,0,${0.05 + rng()*0.25})`;
        ctx.ellipse(x,y, r, r*0.7, rng()*Math.PI, 0, Math.PI*2);
        ctx.fill();
        // inner highlight
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${0.02 + rng()*0.08})`;
        ctx.ellipse(x - r*0.15, y - r*0.15, r*0.5, r*0.35, rng()*Math.PI, 0, Math.PI*2);
        ctx.fill();
      }

      // Polar caps sometimes
      if (rng() > 0.6) {
        const cap = size * (0.06 + rng()*0.18);
        const topGrad = ctx.createLinearGradient(0,0,0,cap);
        topGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        topGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, size, cap);

        const botGrad = ctx.createLinearGradient(0, size, 0, size - cap);
        botGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        botGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, size-cap, size, cap);
      }

      // Add smaller noise and grain
      const img = ctx.getImageData(0,0,size,size);
      for (let i = 0; i < img.data.length; i += 4) {
        const noise = (rng()-0.5) * 10;
        img.data[i] = Math.max(0, Math.min(255, img.data[i] + noise));
        img.data[i+1] = Math.max(0, Math.min(255, img.data[i+1] + noise));
        img.data[i+2] = Math.max(0, Math.min(255, img.data[i+2] + noise));
      }
      ctx.putImageData(img, 0, 0);

      // Roughness map
      const roughCanvas = document.createElement('canvas');
      roughCanvas.width = roughCanvas.height = size;
      const rctx = roughCanvas.getContext('2d');
      rctx.fillStyle = '#c0c0c0';
      rctx.fillRect(0,0,size,size);
      // darker valleys = more glossy (lower value in roughness map)
      splatNoise(rctx, size, size, 1200, 4, 40, (x,y,r,i) => `rgba(${120 + Math.floor(rng()*60)}, ${120 + Math.floor(rng()*60)}, ${120 + Math.floor(rng()*60)}, ${0.08 + rng()*0.18})`);

      // Normal map from height
      const normalCanvas = generateNormalMap(canvas, 2.5);

      const map = new THREE.CanvasTexture(canvas);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(1,1);
      const rough = new THREE.CanvasTexture(roughCanvas);
      rough.wrapS = rough.wrapT = THREE.RepeatWrapping;
      const normal = new THREE.CanvasTexture(normalCanvas);
      normal.wrapS = normal.wrapT = THREE.RepeatWrapping;

      // Cloud layer for rocky planets
      let cloud = null;
      if (rng() > 0.45) {
        const cSize = 1024;
        const cCanvas = document.createElement('canvas');
        cCanvas.width = cCanvas.height = cSize;
        const cctx = cCanvas.getContext('2d');
        cctx.fillStyle = 'rgba(0,0,0,0)';
        cctx.fillRect(0,0,cSize,cSize);
        // paint some soft cloud patches
        splatNoise(cctx, cSize, cSize, 220 + Math.floor(rng()*400), 10, 180, (x,y,r,i) => {
          const a = 0.05 + rng()*0.35;
          return `rgba(255,255,255,${a})`;
        });
        const blurred = blurCanvas(cCanvas, 6);
        cloud = new THREE.CanvasTexture(blurred);
        cloud.wrapS = cloud.wrapT = THREE.RepeatWrapping;
      }

      return { map, roughnessMap: rough, normalMap: normal, roughness: 0.9, metalness: 0.02, cloudMap: cloud };
    }

    // --- DECIDE TYPE & CREATE ---
    const typeStr = (planetData.planet_type || "").toLowerCase();
    const isGasGiant = typeStr.includes("gas") || typeStr.includes("jovian") || typeStr.includes("ice") || typeStr.includes("neptunian");

    const textures = isGasGiant ? createGasGiantTexture(planetData.color || 0xcc9966) : createRockyTexture(planetData.color || 0x8B4513);

    const geometry = new THREE.SphereGeometry(6, 128, 128);
    const material = new THREE.MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap || null,
      roughnessMap: textures.roughnessMap || null,
      roughness: textures.roughness ?? 0.8,
      metalness: textures.metalness ?? 0.03,
      displacementMap: null,
      bumpMap: null,
      // increase clearcoat to give a slightly glossy finish on gas giants
      clearcoat: isGasGiant ? 0.07 : 0.0,
      clearcoatRoughness: isGasGiant ? 0.4 : 1.0,
    });

    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    scene.add(planetMesh);

    // atmosphere / cloud layer as a second mesh
    let cloudMesh = null;
    if (!isGasGiant && textures.cloudMap) {
      const cloudGeo = new THREE.SphereGeometry(6.08, 128, 128);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: textures.cloudMap,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        metalness: 0,
        roughness: 1,
        side: THREE.DoubleSide,
      });
      cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      scene.add(cloudMesh);
    } else if (isGasGiant) {
      const atmoGeo = new THREE.SphereGeometry(6.4, 64, 64);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: planetData.color || 0xcc9966,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      });
      const atmo = new THREE.Mesh(atmoGeo, atmoMat);
      scene.add(atmo);
    }

    // --- ANIMATION ---
    let reqId;
    function animate() {
      reqId = requestAnimationFrame(animate);
      planetMesh.rotation.y += isGasGiant ? 0.0035 : 0.0009;
      if (cloudMesh) cloudMesh.rotation.y += 0.0015;
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
    window.addEventListener('resize', handleResize);

    // --- DISPOSE ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);

      geometry.dispose();
      material.dispose();
      starGeo.dispose();
      starMat.dispose();

      if (textures.map) textures.map.dispose();
      if (textures.roughnessMap) textures.roughnessMap.dispose();
      if (textures.normalMap) textures.normalMap.dispose();
      if (textures.cloudMap) textures.cloudMap.dispose();

      renderer.dispose();
      controls.dispose();
    };
  }, [planetData]);

  return <div ref={mountRef} className="w-full h-full" />;
}
