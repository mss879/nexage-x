"use client";

import React, { useRef } from "react";
import Image from "next/image";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PreloaderProps {
  onActiveReveal: () => void;
  onComplete: () => void;
}

// "The Sphere" — thousands of glowing particles swoop in along curved arcs and
// condense into a sphere: copper-gold upper hemisphere, silver-white lower,
// a dark band at the equator. The core pulses, the sphere bursts past camera
// and black panels part to reveal the hero. All particles live in a single
// THREE.Points draw call; formation/burst are computed in the vertex shader
// from two GSAP-driven uniforms, so per-frame JS cost stays near zero.
// (The previous "Assembly" preloader is archived in components/preloaders/.)
const SPHERE_R = 2.3;
const CAM_Z = 7;
const FOV = 42;

const T0 = 0.15; // formation start
const BUILD_DUR = 2.0;
const T_PULSE = 2.2;
const T_WORDMARK = 2.3;
const T_TEXT_OUT = 3.0;
const T_BURST = 3.1;
const T_COVER = 3.42;
const T_SWAP = 3.82;
const T_DOORS = 3.88;

// Logo-gold palette (upper hemisphere) / silver-white (lower hemisphere) —
// matched to the metallic yellow-gold of the YARI wordmark
const GOLD = [0xfff0c4, 0xffd766, 0xf5b93f, 0xeaa42a, 0xc98a1b, 0x9a6a0e];
const SILVER = [0xffffff, 0xffffff, 0xe8ecf2, 0xc2c9d4, 0x9aa3b0, 0xdfe7f5];

const VERT = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aCtrl;
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aSeed;
  attribute float aDelay;

  uniform float uBuild; // 0 → 1 formation driver
  uniform float uBoom;  // 0 → 1 burst driver
  uniform float uTime;
  uniform float uProj;  // drawing-buffer height / (2 * tan(fov / 2))

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Staggered per-particle formation progress, cubic ease-out
    float p = clamp((uBuild - aDelay * 0.6) / 0.4, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - p, 3.0);
    float u = 1.0 - e;

    // Quadratic bezier: scattered start → arc control → sphere target
    vec3 pos = u * u * aStart + 2.0 * u * e * aCtrl + e * e * position;

    // Gentle drift once settled, so the shell feels alive
    pos += e * 0.02 * vec3(
      sin(uTime * 0.9 + aSeed * 43.0),
      cos(uTime * 1.2 + aSeed * 57.0),
      sin(uTime * 0.7 + aSeed * 71.0)
    );

    // Burst: fly outward along the surface normal, biased past camera
    float bd = clamp((uBoom - aSeed * 0.15) / 0.85, 0.0, 1.0);
    bd *= bd;
    vec3 dir = normalize(position + vec3(0.0, 0.0001, 0.0)) + vec3(0.0, 0.0, 0.55);
    pos += normalize(dir) * bd * (6.0 + aSeed * 7.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float twinkle = 0.72 + 0.38 * sin(uTime * (1.4 + aSeed * 2.6) + aSeed * 6.2831);
    gl_PointSize = max(aSize * twinkle * uProj / max(-mv.z, 0.1), 1.0);

    // Back-of-sphere particles dim slightly — reads as depth
    float depthFade = 1.0 - clamp((-mv.z - ${(CAM_Z - SPHERE_R).toFixed(1)}) / ${(SPHERE_R * 2).toFixed(1)}, 0.0, 1.0) * 0.55;

    vColor = aColor;
    vAlpha = (0.22 + 0.78 * e) * depthFade * (0.85 + 0.15 * twinkle) * (1.0 - bd);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;

  uniform float uGlow;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float body = smoothstep(0.5, 0.06, d);
    vec3 col = vColor * (0.85 + uGlow) + vColor * smoothstep(0.16, 0.0, d) * 0.7;
    gl_FragColor = vec4(col, body * body * vAlpha);
  }
`;

export default function Preloader({ onActiveReveal, onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Minimal fallback: quiet wordmark fade for reduced motion / no WebGL
    const runSimple = () => {
      const tl = gsap.timeline({ onComplete: () => onComplete() });
      tlRef.current = tl;
      tl.set(canvasRef.current, { autoAlpha: 0 }, 0);
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
        antialias: false, // round sprites are shader-feathered; MSAA buys nothing
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
    const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 100);
    camera.position.z = CAM_Z;

    // --- Group hierarchy: parent (responsive scale) > sphere (rotation) ---
    const parentGroup = new THREE.Group();
    const sphereGroup = new THREE.Group();
    parentGroup.add(sphereGroup);
    scene.add(parentGroup);

    // --- Particle attributes ---
    const isMobile = width < 768;
    const COUNT = isMobile ? 5500 : 12000;

    const targets = new Float32Array(COUNT * 3);
    const starts = new Float32Array(COUNT * 3);
    const ctrls = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    const delays = new Float32Array(COUNT);

    const _c = new THREE.Color();
    const _v = new THREE.Vector3();
    const _w = new THREE.Vector3();

    for (let i = 0; i < COUNT; i++) {
      // Direction on the unit sphere, rejection-sampled so density peaks at
      // the poles and dips at the equator (the reference's dark mid band)
      let nx = 0, ny = 0, nz = 0;
      for (let tries = 0; tries < 12; tries++) {
        const theta = Math.random() * Math.PI * 2;
        ny = 2 * Math.random() - 1;
        const s = Math.sqrt(1 - ny * ny);
        nx = s * Math.cos(theta);
        nz = s * Math.sin(theta);
        if (Math.random() < 0.12 + 0.88 * Math.pow(Math.abs(ny), 1.35)) break;
      }

      // ~12% loose "dust" floats just off the shell — the sparkle halo
      const dust = Math.random() < 0.12;
      const r = dust
        ? SPHERE_R * (1.02 + Math.random() * 0.28)
        : SPHERE_R * (0.97 + Math.random() * 0.06);
      const tx = nx * r;
      const ty = ny * r;
      const tz = nz * r;
      targets[i * 3] = tx;
      targets[i * 3 + 1] = ty;
      targets[i * 3 + 2] = tz;

      // Scattered start on a wide shell, kept off the camera axis
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      const sr = 7.5 + Math.random() * 5.5;
      const sx = sr * Math.sin(sPhi) * Math.cos(sTheta);
      const sy = sr * Math.sin(sPhi) * Math.sin(sTheta);
      let sz = sr * Math.cos(sPhi);
      if (sz > 4.5) sz = 4.5 + (sz - 4.5) * 0.25;
      starts[i * 3] = sx;
      starts[i * 3 + 1] = sy;
      starts[i * 3 + 2] = sz;

      // Bezier control: midpoint pushed sideways + up → curved swoop
      _v.set(tx - sx, ty - sy, tz - sz);
      const len = _v.length();
      _w.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).cross(_v);
      if (_w.lengthSq() < 0.001) _w.set(0, 1, 0);
      _w.normalize().multiplyScalar(len * (0.15 + Math.random() * 0.3));
      ctrls[i * 3] = (sx + tx) / 2 + _w.x;
      ctrls[i * 3 + 1] = (sy + ty) / 2 + _w.y + len * 0.1;
      ctrls[i * 3 + 2] = (sz + tz) / 2 + _w.z;

      // Color: gold above the equator band, silver below, dim mix inside it
      const band = 0.07 + Math.random() * 0.05;
      let hex: number;
      let brightness = 0.45 + Math.random() * 0.75;
      if (ny > band) hex = GOLD[Math.floor(Math.random() * GOLD.length)];
      else if (ny < -band) hex = SILVER[Math.floor(Math.random() * SILVER.length)];
      else {
        hex = Math.random() < 0.5 ? GOLD[4] : SILVER[3];
        brightness *= 0.45;
      }
      const hot = !dust && Math.random() < 0.06;
      if (hot) brightness = 1.35;
      if (dust) brightness *= 0.6;
      _c.setHex(hex);
      colors[i * 3] = _c.r * brightness;
      colors[i * 3 + 1] = _c.g * brightness;
      colors[i * 3 + 2] = _c.b * brightness;

      // World-space point diameter (projected to px in the shader)
      sizes[i] = hot
        ? 0.042 + Math.random() * 0.02
        : dust
          ? 0.01 + Math.random() * 0.01
          : 0.013 + Math.random() * 0.021;
      seeds[i] = Math.random();
      delays[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(targets, 3));
    geo.setAttribute("aStart", new THREE.BufferAttribute(starts, 3));
    geo.setAttribute("aCtrl", new THREE.BufferAttribute(ctrls, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));

    const uniforms = {
      uBuild: { value: 0 },
      uBoom: { value: 0 },
      uTime: { value: 0 },
      uGlow: { value: 0.15 },
      uProj: { value: 1 },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false; // particles start far outside the base bounds
    sphereGroup.add(points);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Lower pixel-ratio cap on small screens — biggest mobile fill-rate win
      const pr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2);
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h);
      uniforms.uProj.value = (h * pr) / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
      // Fit the sphere to ~62% of the limiting viewport dimension
      const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
      const halfW = halfH * (w / h);
      const s = (0.62 * Math.min(halfW, halfH)) / SPHERE_R;
      parentGroup.scale.setScalar(s);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- Timeline ---
    let running = true;
    const tl = gsap.timeline({
      onComplete: () => {
        running = false;
        onComplete();
      },
    });
    tlRef.current = tl;

    gsap.set(".yari-logo", { y: 10 });

    // 1. Formation — one linear driver; per-particle stagger/easing in the shader
    tl.to(uniforms.uBuild, { value: 1, duration: BUILD_DUR, ease: "none" }, T0);

    // Shell brightens as it condenses
    tl.to(uniforms.uGlow, { value: 0.35, duration: 0.9, ease: "power2.out" }, 1.3);

    // 3. Pulse — the sphere switches on
    tl.to(uniforms.uGlow, { value: 1.1, duration: 0.35, ease: "power2.out" }, T_PULSE);
    tl.to(uniforms.uGlow, { value: 0.4, duration: 0.5, ease: "power2.inOut" }, T_PULSE + 0.4);
    tl.to(sphereGroup.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.28, ease: "power2.out" }, T_PULSE);
    tl.to(sphereGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.inOut" }, T_PULSE + 0.3);

    // 4. Wordmark
    tl.to(textRef.current, { opacity: 1, duration: 0.1 }, T_WORDMARK);
    tl.to(".yari-logo", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, T_WORDMARK + 0.1);

    // 5. Wordmark out
    tl.to(textRef.current, { autoAlpha: 0, y: -8, duration: 0.35, ease: "power2.in" }, T_TEXT_OUT);

    // 6. Burst — particles streak past camera (same single-driver pattern)
    tl.to(uniforms.uBoom, { value: 1, duration: 0.75, ease: "power3.in" }, T_BURST);
    tl.to(uniforms.uGlow, { value: 1.3, duration: 0.3, ease: "power2.in" }, T_BURST);
    tl.to(parentGroup.scale, { x: 2.2, y: 2.2, z: 2.2, duration: 0.75, ease: "power3.in" }, T_BURST);

    // 7. The screen fades to black (no visible panel shape)
    tl.fromTo(
      coverRef.current,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.32, ease: "power2.inOut", immediateRender: false },
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

    // --- Render loop: slow spin, idle float, mouse parallax ---
    let frameId: number;
    let time = 0;
    const tick = () => {
      if (!running) return;
      time += 0.016;
      uniforms.uTime.value = time;

      parentGroup.position.y = Math.sin(time * 1.1) * 0.05;
      sphereGroup.rotation.y += (time * 0.14 + mouse.x * 0.16 - sphereGroup.rotation.y) * 0.07;
      sphereGroup.rotation.x += (mouse.y * 0.1 + Math.sin(time * 0.5) * 0.03 - sphereGroup.rotation.x) * 0.07;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      running = false;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);

      scene.remove(parentGroup);
      geo.dispose();
      mat.dispose();
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

      {/* YARI wordmark — centered inside the sphere's dark equator band */}
      <div
        ref={textRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none select-none opacity-0"
      >
        <Image
          src="/yari-logo-text.png"
          alt="YARI"
          width={480}
          height={104}
          priority
          className="yari-logo opacity-0 h-9 sm:h-11 md:h-[48px] w-auto object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Black cover that the screen fades into at the burst */}
      <div
        ref={coverRef}
        className="absolute inset-0 z-20 bg-[#050508] will-change-transform"
        style={{ opacity: 0, visibility: "hidden" }}
      />

      {/* Black doors that part to reveal the hero */}
      <div
        ref={leftDoorRef}
        className="absolute inset-y-0 left-0 z-30 w-1/2 bg-[#050508] border-r border-[#df8326]/30 will-change-transform"
        style={{ display: "none" }}
      />
      <div
        ref={rightDoorRef}
        className="absolute inset-y-0 right-0 z-30 w-1/2 bg-[#050508] border-l border-[#df8326]/30 will-change-transform"
        style={{ display: "none" }}
      />
    </div>
  );
}
