"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// ARCHIVED PRELOADER — "The Assembly" (saved 2026-07-11, replaced by the
// particle-sphere preloader). To restore, point the dynamic import in
// src/components/sections/HeroWithPreloader.tsx at
// "@/components/preloaders/PreloaderAssembly".
interface PreloaderProps {
  onActiveReveal: () => void;
  onComplete: () => void;
}

// "The Assembly" — 27 porcelain-white modules swoop in along curved arcs and
// snap into a 3×3×3 stack (storefront / automation / logistics layers), the
// orange core ignites, the block detonates past camera and #18181b panels
// part to reveal the hero. Rendered as a single InstancedMesh (+ core mesh)
// driven by one GSAP tween for minimal draw calls and per-frame cost.
const GRID_STEP = 0.84; // cube size + gap (tight Rubik-style seams, like the About cube)
const CUBE_SIZE = 0.78;

const T0 = 0.15; // assembly start
const STAGGER = 0.045;
const FLY_DUR = 0.85; // per-cube flight window (long overlap = fluid motion)
const T_ASSEMBLED = T0 + 26 * STAGGER + FLY_DUR; // ≈2.17
const T_PULSE = 2.2;
const T_WORDMARK = 2.3;
const T_HUD_OUT = 3.0;
const T_DETONATE = 3.1;
const T_COVER = 3.42;
const T_SWAP = 3.82;
const T_DOORS = 3.88;

const CHECKLIST = ["Storefront", "Automation", "Logistics"];

interface CubeData {
  core: boolean;
  idx: number; // instance index (non-core only)
  delay: number;
  sx: number; sy: number; sz: number; // scattered start
  cx: number; cy: number; cz: number; // bezier control (arc)
  tx: number; ty: number; tz: number; // grid target
  q0: THREE.Quaternion; // tumbling start orientation
  dx: number; dy: number; dz: number; // detonation direction
  boomDist: number;
  boomDelay: number;
  ax: number; ay: number; az: number; // detonation spin axis
  spin: number;
}

export default function PreloaderAssembly({ onActiveReveal, onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Minimal studio environment so the porcelain modules catch soft reflections
  const createEnvTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#899098");
    grad.addColorStop(0.38, "#eef0f3");
    grad.addColorStop(0.47, "#ffffff");
    grad.addColorStop(0.52, "#df8326");
    grad.addColorStop(0.58, "#43464d");
    grad.addColorStop(1, "#191b1f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = "rgba(255, 245, 230, 0.9)";
    ctx.fillRect(30, 0, 10, 128);
    ctx.fillRect(120, 0, 14, 128);
    ctx.fillRect(210, 0, 8, 128);
    ctx.fillStyle = "rgba(255, 200, 120, 0.5)";
    ctx.fillRect(0, 18, 256, 6);
    return canvas;
  };

  // Face texture matching the About Us cube: gradient face + hairline seam
  // border + top sheen. Baked borders replace 27 edge-line draw calls.
  const createFaceTexture = (core: boolean) => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const grad = ctx.createLinearGradient(0, 0, 128, 128);
    if (core) {
      grad.addColorStop(0, "#ffd8b3");
      grad.addColorStop(0.5, "#df8326");
      grad.addColorStop(1, "#994d00");
    } else {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.55, "#f4f4f5");
      grad.addColorStop(1, "#d9d9de");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const sheen = ctx.createLinearGradient(0, 0, 0, 44);
    sheen.addColorStop(0, core ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.9)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, 128, 44);
    ctx.strokeStyle = core ? "#ffb266" : "rgba(12, 12, 16, 0.4)";
    ctx.lineWidth = core ? 4 : 3;
    ctx.strokeRect(1.5, 1.5, 125, 125);
    return canvas;
  };

  // Soft orange halo sprite for the burning core
  const createGlowTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255, 214, 150, 0.9)");
    grad.addColorStop(0.25, "rgba(223, 131, 38, 0.55)");
    grad.addColorStop(1, "rgba(223, 131, 38, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return canvas;
  };

  useGSAP(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Minimal fallback: quiet wordmark fade for reduced motion / no WebGL
    const runSimple = () => {
      const tl = gsap.timeline({ onComplete: () => onComplete() });
      tlRef.current = tl;
      tl.set([canvasRef.current, hudRef.current], { autoAlpha: 0 }, 0);
      tl.set(".yari-logo", { y: 0 }, 0);
      tl.to(textRef.current, { opacity: 1, duration: 0.3 }, 0.1);
      tl.to(".yari-logo", { opacity: 1, duration: 0.35 }, 0.2);
      tl.add(() => onActiveReveal(), 1.4);
      tl.to(containerRef.current, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 1.45);
    };

    if (reduce) {
      runSimple();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      runSimple();
      return;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.z = 10.5;

    const envCanvas = createEnvTexture();
    let envTexture: THREE.CanvasTexture | null = null;
    if (envCanvas) {
      envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = envTexture;
    }

    // --- Lighting: clean white key + orange core (env map fills the rest) ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(4, 6, 8);
    scene.add(keyLight);

    const coreLight = new THREE.PointLight(0xdf8326, 0, 7);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // --- Group hierarchy: parent (responsive scale) > iso (tilt + zoom) ---
    const parentGroup = new THREE.Group();
    const isoGroup = new THREE.Group();
    const ISO_X = 0.5;
    const ISO_Y = Math.PI / 4;
    isoGroup.rotation.set(ISO_X, ISO_Y, 0);
    parentGroup.add(isoGroup);
    scene.add(parentGroup);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Lower pixel-ratio cap on small screens — biggest mobile fill-rate win
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2));
      renderer.setSize(w, h);
      parentGroup.scale.setScalar(w < 768 ? 0.52 : 0.80);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- Materials: porcelain white + glowing core, seams baked into maps ---
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const makeTex = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return null;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      return tex;
    };
    const whiteTex = makeTex(createFaceTexture(false));
    const coreTex = makeTex(createFaceTexture(true));

    const whiteMat = new THREE.MeshStandardMaterial({
      map: whiteTex ?? undefined,
      color: whiteTex ? 0xffffff : 0xf5f5f7,
      metalness: 0.05,
      roughness: 0.32,
      envMapIntensity: 0.7,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      map: coreTex ?? undefined,
      color: coreTex ? 0xffffff : 0xdf8326,
      emissive: 0xdf8326,
      emissiveIntensity: 0.45,
      metalness: 0.2,
      roughness: 0.4,
    });

    const boxGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);

    // --- Core glow sprite ---
    const glowCanvas = createGlowTexture();
    let glowTexture: THREE.CanvasTexture | null = null;
    let glowMat: THREE.SpriteMaterial | null = null;
    if (glowCanvas) {
      glowTexture = new THREE.CanvasTexture(glowCanvas);
      glowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowSprite = new THREE.Sprite(glowMat);
      glowSprite.scale.setScalar(4.2);
      isoGroup.add(glowSprite);
    }

    // --- Build the 27 cells, ordered bottom layer → top (with jitter) ---
    const cells: { x: number; y: number; z: number; key: number }[] = [];
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          cells.push({ x, y, z, key: (y + 1) * 100 + (x + z + 2) * 10 + Math.random() * 8 });
        }
      }
    }
    cells.sort((a, b) => a.key - b.key);

    // Single instanced mesh for the 26 white modules — 1 draw call instead of 26
    const instMesh = new THREE.InstancedMesh(boxGeo, whiteMat, 26);
    instMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instMesh.frustumCulled = false; // instances scatter far outside the base bounds
    isoGroup.add(instMesh);

    const coreMesh = new THREE.Mesh(boxGeo, coreMat);
    isoGroup.add(coreMesh);

    const _v = new THREE.Vector3();
    const _w = new THREE.Vector3();
    const cubes: CubeData[] = [];
    let instIdx = 0;
    cells.forEach((cell, i) => {
      const core = cell.x === 0 && cell.y === 0 && cell.z === 0;
      const tx = cell.x * GRID_STEP;
      const ty = cell.y * GRID_STEP;
      const tz = cell.z * GRID_STEP;

      // Scattered start on a wide sphere, kept off the camera axis
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 7.5 + Math.random() * 3.5;
      const sx = r * Math.sin(phi) * Math.cos(theta);
      const sy = r * Math.sin(phi) * Math.sin(theta);
      let sz = r * Math.cos(phi);
      if (sz > 4) sz = 4 + (sz - 4) * 0.25;

      // Bezier control point: midpoint pushed sideways + up → curved swoop
      _v.set(tx - sx, ty - sy, tz - sz);
      const len = _v.length();
      _w.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).cross(_v);
      if (_w.lengthSq() < 0.001) _w.set(0, 1, 0);
      _w.normalize().multiplyScalar(len * (0.18 + Math.random() * 0.25));
      const cx = (sx + tx) / 2 + _w.x;
      const cy = (sy + ty) / 2 + _w.y + len * 0.12;
      const cz = (sz + tz) / 2 + _w.z;

      const q0 = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          (Math.random() - 0.5) * Math.PI * 1.6,
          (Math.random() - 0.5) * Math.PI * 1.6,
          (Math.random() - 0.5) * Math.PI * 1.6
        )
      );

      // Detonation vector (past camera), spin axis and timing jitter
      _v.set(tx, ty, tz);
      if (_v.lengthSq() < 0.001) _v.set(0, 0.2, 1);
      _v.normalize()
        .add(_w.set((Math.random() - 0.5) * 0.8, (Math.random() - 0.3) * 0.8, (Math.random() - 0.5) * 0.8))
        .normalize();
      _w.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();

      cubes.push({
        core,
        idx: core ? -1 : instIdx++,
        delay: i * STAGGER,
        sx, sy, sz,
        cx, cy, cz,
        tx, ty, tz,
        q0,
        dx: _v.x, dy: _v.y, dz: _v.z,
        boomDist: 8 + Math.random() * 4,
        boomDelay: Math.random() * 0.12,
        ax: _w.x, ay: _w.y, az: _w.z,
        spin: 2.5 + Math.random() * 2.5,
      });
    });

    // --- Single-driver cube animation (replaces ~110 individual tweens) ---
    const driver = { build: 0, boom: 0 };
    const SPAN = 26 * STAGGER + FLY_DUR;
    const qIdentity = new THREE.Quaternion();
    const _p = new THREE.Vector3();
    const _q = new THREE.Quaternion();
    const _s = new THREE.Vector3(1, 1, 1);
    const _m = new THREE.Matrix4();
    const _axis = new THREE.Vector3();

    // Soft overshoot along the arc — cubes glide in and settle
    const easeFly = (p: number) => {
      const c1 = 1.2;
      const t = p - 1;
      return 1 + (c1 + 1) * t * t * t + c1 * t * t;
    };
    const easeCubic = (p: number) => 1 - (1 - p) * (1 - p) * (1 - p);

    const updateCubes = () => {
      for (let i = 0; i < cubes.length; i++) {
        const c = cubes[i];
        let px: number, py: number, pz: number;

        if (driver.boom > 0.0001) {
          const bl = Math.min(1, Math.max(0, (driver.boom - c.boomDelay) / (1 - c.boomDelay)));
          px = c.tx + c.dx * c.boomDist * bl;
          py = c.ty + c.dy * c.boomDist * bl;
          pz = c.tz + c.dz * c.boomDist * bl;
          _axis.set(c.ax, c.ay, c.az);
          _q.setFromAxisAngle(_axis, bl * c.spin);
        } else {
          const p = Math.min(1, Math.max(0, (driver.build * SPAN - c.delay) / FLY_DUR));
          if (p <= 0) {
            px = c.sx; py = c.sy; pz = c.sz;
            _q.copy(c.q0);
          } else {
            const e = easeFly(p);
            const u = 1 - e;
            px = u * u * c.sx + 2 * u * e * c.cx + e * e * c.tx;
            py = u * u * c.sy + 2 * u * e * c.cy + e * e * c.ty;
            pz = u * u * c.sz + 2 * u * e * c.cz + e * e * c.tz;
            // Orientation settles just before arrival — reads organic, not robotic
            _q.slerpQuaternions(c.q0, qIdentity, easeCubic(Math.min(1, p * 1.15)));
          }
        }

        if (c.core) {
          coreMesh.position.set(px, py, pz);
          coreMesh.quaternion.copy(_q);
        } else {
          _p.set(px, py, pz);
          _m.compose(_p, _q, _s);
          instMesh.setMatrixAt(c.idx, _m);
        }
      }
      instMesh.instanceMatrix.needsUpdate = true;
    };
    updateCubes();

    // --- Timeline ---
    let running = true;
    const counterState = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        running = false;
        onComplete();
      },
    });
    tlRef.current = tl;

    gsap.set(".pl-hud-item", { autoAlpha: 0 });
    gsap.set(".pl-check", { autoAlpha: 0, x: -14 });
    gsap.set(".yari-logo", { y: 10 });

    // 1. HUD in
    tl.to(".pl-hud-item", { autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0.1);

    // 2. Assembly — one linear driver; per-cube arcs/easing computed in updateCubes
    tl.to(driver, { build: 1, duration: SPAN, ease: "none" }, T0);

    // Counter 000 → 100 across the assembly
    tl.to(
      counterState,
      {
        v: 100,
        duration: T_ASSEMBLED - T0,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.round(counterState.v)).padStart(3, "0");
          }
        },
      },
      T0
    );

    // Checklist ticks as each layer of 9 lands
    CHECKLIST.forEach((_, i) => {
      const at = T0 + (i * 9 + 8) * STAGGER + FLY_DUR;
      tl.to(`.pl-check-${i}`, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" }, at);
      tl.to(`.pl-sq-${i}`, { backgroundColor: "#df8326", duration: 0.25 }, at + 0.1);
    });

    // Core warms up while the stack builds
    tl.to(coreLight, { intensity: 1.2, duration: 0.9, ease: "power2.out" }, 1.3);
    if (glowMat) tl.to(glowMat, { opacity: 0.35, duration: 0.9, ease: "power2.out" }, 1.3);

    // 3. Pulse — the machine switches on
    tl.to(coreLight, { intensity: 2.8, distance: 9, duration: 0.35, ease: "power2.out" }, T_PULSE);
    tl.to(coreLight, { intensity: 1.4, duration: 0.5, ease: "power2.inOut" }, T_PULSE + 0.4);
    if (glowMat) {
      tl.to(glowMat, { opacity: 0.85, duration: 0.35, ease: "power2.out" }, T_PULSE);
      tl.to(glowMat, { opacity: 0.45, duration: 0.5, ease: "power2.inOut" }, T_PULSE + 0.4);
    }
    tl.to(isoGroup.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.28, ease: "power2.out" }, T_PULSE);
    tl.to(isoGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.inOut" }, T_PULSE + 0.3);

    // 4. Wordmark
    tl.to(textRef.current, { opacity: 1, duration: 0.1 }, T_WORDMARK);
    tl.to(".yari-logo", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, T_WORDMARK + 0.1);

    // 5. HUD + wordmark out
    tl.to([hudRef.current, textRef.current], { autoAlpha: 0, y: -8, duration: 0.35, ease: "power2.in" }, T_HUD_OUT);

    // 6. Detonation — cubes fly past camera (same single-driver pattern)
    tl.to(driver, { boom: 1, duration: 0.75, ease: "power3.in" }, T_DETONATE);
    tl.to(isoGroup.scale, { x: 2.8, y: 2.8, z: 2.8, duration: 0.75, ease: "power3.in" }, T_DETONATE);
    if (glowMat) tl.to(glowMat, { opacity: 0, duration: 0.3, ease: "power2.in" }, T_DETONATE + 0.05);

    // 7. A face fills the screen → becomes the #18181b frame
    tl.fromTo(
      coverRef.current,
      { autoAlpha: 1, scale: 0.05, borderRadius: "24px" },
      { scale: 1, borderRadius: "0px", duration: 0.38, ease: "power3.in", immediateRender: false },
      T_COVER
    );

    // 8. Swap to doors + start the hero behind them
    tl.set([leftDoorRef.current, rightDoorRef.current], { display: "block" }, T_SWAP);
    tl.set(coverRef.current, { autoAlpha: 0 }, T_SWAP + 0.02);
    tl.set(containerRef.current, { backgroundColor: "transparent" }, T_SWAP + 0.02);
    tl.set([canvasRef.current, fxRef.current], { autoAlpha: 0 }, T_SWAP + 0.02);
    tl.add(() => onActiveReveal(), T_SWAP + 0.02);

    // 9. Doors part to reveal the hero
    tl.to(leftDoorRef.current, { xPercent: -100.5, duration: 0.85, ease: "power4.inOut" }, T_DOORS);
    tl.to(rightDoorRef.current, { xPercent: 100.5, duration: 0.85, ease: "power4.inOut" }, T_DOORS);

    // --- Render loop: idle float, wobble, mouse parallax ---
    let frameId: number;
    let time = 0;
    let lastBuild = -1;
    let lastBoom = -1;
    const tick = () => {
      if (!running) return;
      time += 0.016;

      parentGroup.position.y = Math.sin(time * 1.1) * 0.06;

      const targetRotX = ISO_X + mouse.y * 0.07 + Math.sin(time * 0.5) * 0.03;
      const targetRotY = ISO_Y + mouse.x * 0.12 + Math.cos(time * 0.4) * 0.03;
      isoGroup.rotation.x += (targetRotX - isoGroup.rotation.x) * 0.07;
      isoGroup.rotation.y += (targetRotY - isoGroup.rotation.y) * 0.07;

      // Recompute cube transforms only while the driver is actually moving
      if (driver.build !== lastBuild || driver.boom !== lastBoom) {
        lastBuild = driver.build;
        lastBoom = driver.boom;
        updateCubes();
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      running = false;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);

      scene.remove(parentGroup, ambient, keyLight, coreLight);
      instMesh.dispose();
      boxGeo.dispose();
      whiteMat.dispose();
      coreMat.dispose();
      if (whiteTex) whiteTex.dispose();
      if (coreTex) coreTex.dispose();
      if (glowMat) glowMat.dispose();
      if (glowTexture) glowTexture.dispose();
      if (envTexture) envTexture.dispose();
      renderer.dispose();
    };
  }, { scope: containerRef, dependencies: [onActiveReveal, onComplete] });

  // Click anywhere fast-forwards without skipping beats
  const handleSkip = () => {
    tlRef.current?.timeScale(2.6);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleSkip}
      className="fixed inset-0 z-[100] bg-[#050508] overflow-hidden pointer-events-auto"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />

      {/* Vignette + grain, matching the site's texture language */}
      <div
        ref={fxRef}
        className="absolute inset-0 z-[2] pointer-events-none grain-texture"
        style={{ background: "radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.5) 100%)" }}
      />

      {/* HUD — assembly telemetry */}
      <div ref={hudRef} className="absolute inset-0 z-10 pointer-events-none select-none">
        <div className="pl-hud-item absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#df8326] animate-pulse" />
          <span className="font-mono text-[11px] md:text-xs uppercase tracking-[0.22em] text-[#8e9aa8]">
            Assembling Stack
          </span>
        </div>

        <div className="pl-hud-item absolute top-6 right-6 md:top-8 md:right-8 font-mono text-[11px] md:text-xs uppercase tracking-[0.22em] text-[#df8326]">
          <span ref={counterRef}>000</span>&nbsp;%
        </div>

        <div className="absolute left-6 top-16 md:left-auto md:top-1/2 md:right-[9%] md:-translate-y-1/2 flex flex-col gap-3.5">
          {CHECKLIST.map((label, i) => (
            <div key={label} className={`pl-check pl-check-${i} flex items-center gap-3`}>
              <span className={`pl-sq-${i} block w-2 h-2 bg-[#3a3a42]`} />
              <span className="font-mono text-[11px] md:text-xs uppercase tracking-[0.18em] text-[#c7ccd4]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* YARI wordmark */}
      <div
        ref={textRef}
        className="absolute bottom-[18%] left-0 right-0 z-10 flex flex-col items-center pointer-events-none select-none opacity-0"
      >
        <img
          src="/yari-logo-text.png"
          alt="YARI"
          className="yari-logo opacity-0 h-9 sm:h-11 md:h-[48px] w-auto object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Cube face that fills the screen at detonation */}
      <div
        ref={coverRef}
        className="absolute inset-0 z-20 bg-[#18181b] will-change-transform"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      {/* Frame doors that part to reveal the hero */}
      <div
        ref={leftDoorRef}
        className="absolute inset-y-0 left-0 z-30 w-1/2 bg-[#18181b] border-r border-[#df8326]/30 will-change-transform"
        style={{ display: "none" }}
      />
      <div
        ref={rightDoorRef}
        className="absolute inset-y-0 right-0 z-30 w-1/2 bg-[#18181b] border-l border-[#df8326]/30 will-change-transform"
        style={{ display: "none" }}
      />
    </div>
  );
}
