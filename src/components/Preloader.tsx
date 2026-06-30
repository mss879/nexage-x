"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Logo from "@/components/ui/Logo";

interface PreloaderProps {
  onActiveReveal: () => void;
  onComplete: () => void;
}

export default function Preloader({ onActiveReveal, onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Procedural Studio Environment Map (Equirectangular)
  const createEnvironmentTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. High-contrast studio backdrop gradient (dark reflections make metal look realistic)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, "#121212");      // Dark charcoal sky dome
    grad.addColorStop(0.35, "#252015");     // Warm glow overhead sky
    grad.addColorStop(0.46, "#d4921d");     // Rich amber-gold horizon line
    grad.addColorStop(0.48, "#ffffff");     // Mirror highlight stripe
    grad.addColorStop(0.50, "#000000");     // Deep black reflection line (creates heavy contrast)
    grad.addColorStop(0.65, "#1c1303");     // Deep dark golden bronze floor
    grad.addColorStop(1.0, "#010101");      // Pitch black bottom floor
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // 2. White & Amber vertical softbox light panels (for sharp high-contrast highlights)
    ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
    ctx.fillRect(120, 0, 35, 512);
    ctx.fillRect(450, 0, 50, 512);
    ctx.fillRect(780, 0, 30, 512);

    ctx.fillStyle = "rgba(240, 160, 40, 0.75)";
    ctx.fillRect(250, 0, 40, 512);
    ctx.fillRect(600, 0, 35, 512);

    // 3. Horizontal studio ceiling light tubes/grids (gives beautiful cross reflections on diagonals/curves)
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, 60, 1024, 15);
    ctx.fillRect(0, 140, 1024, 25);
    ctx.fillRect(0, 220, 1024, 10);

    // 4. Soft golden spotlights
    const drawSpot = (cx: number, cy: number, r: number, color: string) => {
      const spotGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      spotGrad.addColorStop(0, color);
      spotGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };
    drawSpot(250, 150, 100, "rgba(255, 220, 120, 0.9)");
    drawSpot(750, 150, 120, "rgba(255, 220, 120, 0.9)");
    drawSpot(512, 380, 200, "rgba(240, 170, 50, 0.3)"); // floor warm ambient light reflection

    return canvas;
  };

  // Procedural Brushed Gold Texture Generator
  const createBrushedGoldTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Rich gold base gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 256);
    baseGrad.addColorStop(0, "#b88d2f");
    baseGrad.addColorStop(0.5, "#c59b35");
    baseGrad.addColorStop(1, "#8a6116");
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 256, 256);

    // 2. Add fine vertical scratches (brushed texture)
    for (let i = 0; i < 1100; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const length = Math.random() * 60 + 20;
      const opacity = Math.random() * 0.12 + 0.04;

      // Specular highlight scratches (bright cream/white)
      ctx.strokeStyle = `rgba(255, 255, 240, ${opacity})`;
      ctx.lineWidth = Math.random() * 0.9 + 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + length);
      ctx.stroke();

      // Shadow grooves (dark bronze/black-gold)
      ctx.strokeStyle = `rgba(60, 35, 5, ${opacity * 1.4})`;
      ctx.beginPath();
      ctx.moveTo(x + 1, y);
      ctx.lineTo(x + 1, y + length);
      ctx.stroke();
    }

    return canvas;
  };

  // Procedural Brushed Silver Texture Generator
  const createBrushedSilverTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Rich silver base gradient
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 256);
    baseGrad.addColorStop(0, "#dfdfdf");
    baseGrad.addColorStop(0.5, "#ffffff");
    baseGrad.addColorStop(1, "#bcbcbc");
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 256, 256);

    // 2. Add fine vertical scratches (brushed texture)
    for (let i = 0; i < 1100; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const length = Math.random() * 60 + 20;
      const opacity = Math.random() * 0.12 + 0.04;

      // Specular highlight scratches (bright white)
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = Math.random() * 0.9 + 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + length);
      ctx.stroke();

      // Shadow grooves (dark grey/black)
      ctx.strokeStyle = `rgba(80, 80, 80, ${opacity * 1.4})`;
      ctx.beginPath();
      ctx.moveTo(x + 1, y);
      ctx.lineTo(x + 1, y + length);
      ctx.stroke();
    }

    return canvas;
  };

  // Procedural Sharp Square Pixel Particle Texture
  const createPixelTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
    ctx.fillRect(1, 1, 14, 14);

    return canvas;
  };

  // 3D Shape Creation for the YARI Logo (Silver V and Split Gold Stems)
  const createVShape = () => {
    const shape = new THREE.Shape();
    // Compact, sharp silver chevron (arms shortened ~35% along their axis from
    // the central dip, keeping angle/thickness) with a central DOWNWARD spike
    // (outer apex at y=0.17) nestling between the gold tips.
    shape.moveTo(-1.08, 1.15);
    shape.lineTo(-0.64, 1.15);
    shape.lineTo(0, 0.54);
    shape.lineTo(0.64, 1.15);
    shape.lineTo(1.08, 1.15);
    shape.lineTo(0, 0.17);
    shape.closePath();
    return shape;
  };

  const createLeftStemShape = () => {
    const shape = new THREE.Shape();
    // Left gold prong: a CLOSE vertical leg (inner edge x=-0.06, so only a 0.12 gap
    // between the two legs) whose top forks up-and-out to a point. The inner prong
    // edge runs PARALLEL to the silver V's surface with the same 0.12 gap.
    shape.moveTo(-0.62, 0.55);   // prong tip — faces up-left / outward
    shape.lineTo(-0.06, 0.063);  // inner edge bend (parallel-to-silver edge meets the vertical leg)
    shape.lineTo(-0.06, -1.39);  // bottom-inner tip — faces down-in
    shape.lineTo(-0.26, -1.05);  // bottom-outer
    shape.lineTo(-0.26, 0.0);    // outer leg edge (vertical)
    shape.closePath();           // outer prong edge up to the tip
    return shape;
  };

  const createRightStemShape = () => {
    const shape = new THREE.Shape();
    // Right gold prong (mirror of the left).
    shape.moveTo(0.62, 0.55);
    shape.lineTo(0.06, 0.063);
    shape.lineTo(0.06, -1.39);
    shape.lineTo(0.26, -1.05);
    shape.lineTo(0.26, 0.0);
    shape.closePath();
    return shape;
  };

  useGSAP(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // --- Three.js Setup ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8.0;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Procedural Environment Map (Studio Lighting) ---
    const envCanvas = createEnvironmentTexture();
    let envTexture: THREE.CanvasTexture | null = null;
    if (envCanvas) {
      envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = envTexture;
    }

    // --- Lighting Rig (Configured to pop metallic beveled facets) ---
    const ambientLight = new THREE.AmbientLight(0xfffbf0, 0.18);
    scene.add(ambientLight);

    const frontKeyLight = new THREE.DirectionalLight(0xffeed6, 1.35);
    frontKeyLight.position.set(0, 1, 9);
    scene.add(frontKeyLight);

    const topLight = new THREE.DirectionalLight(0xffeaad, 0.65);
    topLight.position.set(0, 8, 2);
    scene.add(topLight);

    const bottomLight = new THREE.DirectionalLight(0xffd280, 0.35);
    bottomLight.position.set(0, -8, 2);
    scene.add(bottomLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(-6, 0, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight2.position.set(6, 0, 3);
    scene.add(dirLight2);

    const hubLight = new THREE.PointLight(0xffb347, 1.4, 10);
    hubLight.position.set(0, -0.5, 0.5);
    scene.add(hubLight);

    // --- Group Hierarchy ---
    const parentGroup = new THREE.Group();
    const logoGroup = new THREE.Group();
    parentGroup.add(logoGroup);
    scene.add(parentGroup);

    // Responsive scaling
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      // Scaled down further to be elegant and leave space for welcome text below
      if (w < 768) {
        parentGroup.scale.setScalar(0.38);
      } else {
        parentGroup.scale.setScalar(0.58);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // --- Mouse Parallax Tracking ---
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- Brushed Gold & Silver Textures & Metallic Materials ---
    const goldCanvas = createBrushedGoldTexture();
    let goldTexture: THREE.CanvasTexture | null = null;
    let goldMaterial: THREE.MeshPhysicalMaterial;

    if (goldCanvas) {
      goldTexture = new THREE.CanvasTexture(goldCanvas);
      goldTexture.wrapS = THREE.RepeatWrapping;
      goldTexture.wrapT = THREE.RepeatWrapping;
      goldTexture.repeat.set(2.5, 2.5);

      goldMaterial = new THREE.MeshPhysicalMaterial({
        map: goldTexture,
        roughnessMap: goldTexture,
        bumpMap: goldTexture,
        bumpScale: 0.001,
        color: 0xe5a93b,             // Rich gold color
        metalness: 1.0,
        roughness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        ior: 2.5,
        reflectivity: 1.0,
        sheen: 0.6,
        sheenColor: 0xffe699,
        transparent: true,
        opacity: 0
      });
    } else {
      goldMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe5a93b,
        metalness: 1.0,
        roughness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        ior: 2.5,
        reflectivity: 1.0,
        sheen: 0.6,
        sheenColor: 0xffe699,
        transparent: true,
        opacity: 0
      });
    }

    const silverCanvas = createBrushedSilverTexture();
    let silverTexture: THREE.CanvasTexture | null = null;
    let silverMaterial: THREE.MeshPhysicalMaterial;

    if (silverCanvas) {
      silverTexture = new THREE.CanvasTexture(silverCanvas);
      silverTexture.wrapS = THREE.RepeatWrapping;
      silverTexture.wrapT = THREE.RepeatWrapping;
      silverTexture.repeat.set(2.5, 2.5);

      silverMaterial = new THREE.MeshPhysicalMaterial({
        map: silverTexture,
        roughnessMap: silverTexture,
        bumpMap: silverTexture,
        bumpScale: 0.001,
        color: 0xdddddd,             // Silver base color
        metalness: 1.0,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        ior: 2.0,
        reflectivity: 0.9,
        sheen: 0.3,
        sheenColor: 0xffffff,
        transparent: true,
        opacity: 0
      });
    } else {
      silverMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xdddddd,
        metalness: 1.0,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        ior: 2.0,
        reflectivity: 0.9,
        sheen: 0.3,
        sheenColor: 0xffffff,
        transparent: true,
        opacity: 0
      });
    }

    // --- Geometries ---
    const vShape = createVShape();
    const leftStemShape = createLeftStemShape();
    const rightStemShape = createRightStemShape();

    // Extrusion Settings - Sharper bevel settings to avoid acute corner round-shrinkage
    const extrudeSettings = {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.015,             // Sharper bevel prevents gap widening at sharp bottom corners
      bevelThickness: 0.015
    };

    // Create Geometries
    const geomV = new THREE.ExtrudeGeometry(vShape, extrudeSettings);
    const geomLeftStem = new THREE.ExtrudeGeometry(leftStemShape, extrudeSettings);
    const geomRightStem = new THREE.ExtrudeGeometry(rightStemShape, extrudeSettings);

    // Center geometries in Z (depth/2 = 0.11)
    const zOffsetShift = -0.11;
    geomV.translate(0, 0, zOffsetShift);
    geomLeftStem.translate(0, 0, zOffsetShift);
    geomRightStem.translate(0, 0, zOffsetShift);

    // Create Meshes
    const meshV = new THREE.Mesh(geomV, silverMaterial);
    const meshLeftStem = new THREE.Mesh(geomLeftStem, goldMaterial);
    const meshRightStem = new THREE.Mesh(geomRightStem, goldMaterial);

    const solidMeshes = [meshV, meshLeftStem, meshRightStem];
    logoGroup.add(...solidMeshes);

    // Hide solid meshes initially
    gsap.set(solidMeshes, { visible: false });

    // --- "Form from Pixels" Point Sampling Math ---
    const silverTargets: THREE.Vector3[] = [];
    const goldTargets: THREE.Vector3[] = [];

    // 1. Sample silver V shape (400 points)
    const vPerp = new THREE.Vector2(0.707, 0.707);

    for (let i = 0; i < 200; i++) {
      const t = i / 199;
      // Left branch centerline: from the central spike (0, 0.355) to the
      // shortened top corner (-0.86, 1.15) — matches the trimmed silver chevron.
      const lx_c = -0.86 * t;
      const ly_c = 0.355 + 0.795 * t;
      const offset = (Math.random() - 0.5) * 0.50; // perpendicular width
      const rx = lx_c + offset * vPerp.x;
      const ry = ly_c + offset * vPerp.y;
      const rz = (Math.random() - 0.5) * 0.22;
      silverTargets.push(new THREE.Vector3(rx, ry, rz));

      // Right branch centerline: mirror of the left
      const rx_c = 0.86 * t;
      const ry_c = 0.355 + 0.795 * t;
      const rx2 = rx_c + offset * (-vPerp.x);
      const ry2 = ry_c + offset * vPerp.y;
      const rz2 = (Math.random() - 0.5) * 0.22;
      silverTargets.push(new THREE.Vector3(rx2, ry2, rz2));
    }

    // 2. Sample Left and Right Gold prongs (400 points each): a close vertical leg
    //    plus an up-and-out prong that runs parallel to the silver V surface.
    const sampleGoldColumn = (isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;

      // a. Vertical leg (250 points) — centered at x=0.16, width 0.20, y -1.39 to 0.05
      for (let i = 0; i < 250; i++) {
        const t = i / 249;
        const rx = sign * 0.16 + (Math.random() - 0.5) * 0.20;
        const ry = -1.39 + 1.44 * t;
        const rz = (Math.random() - 0.5) * 0.22;
        goldTargets.push(new THREE.Vector3(rx, ry, rz));
      }

      // b. Up-and-out prong (150 points) — from the bend (0.16, 0.0) to the tip (0.55, 0.52),
      //    width tapering toward the point.
      for (let i = 0; i < 150; i++) {
        const t = i / 149;
        const cx = 0.16 + 0.39 * t;
        const cy = 0.0 + 0.52 * t;
        const halfW = 0.10 * (1 - 0.6 * t);
        const off = (Math.random() * 2 - 1) * halfW;
        const rx = sign * (cx + off * 0.8);
        const ry = cy + off * -0.6;
        const rz = (Math.random() - 0.5) * 0.22;
        goldTargets.push(new THREE.Vector3(rx, ry, rz));
      }
    };

    sampleGoldColumn(true);  // Left gold column
    sampleGoldColumn(false); // Right gold column

    // --- Scattered Initial State & Buffer Setup ---
    const silverStartPositions: THREE.Vector3[] = [];
    const silverPositionsArray = new Float32Array(silverTargets.length * 3);

    for (let i = 0; i < silverTargets.length; i++) {
      const rx = (Math.random() - 0.5) * 8.5;
      const ry = (Math.random() - 0.5) * 8.5;
      const rz = (Math.random() - 0.5) * 4.0;
      silverStartPositions.push(new THREE.Vector3(rx, ry, rz));

      silverPositionsArray[i * 3] = rx;
      silverPositionsArray[i * 3 + 1] = ry;
      silverPositionsArray[i * 3 + 2] = rz;
    }

    const silverGeometry = new THREE.BufferGeometry();
    silverGeometry.setAttribute("position", new THREE.BufferAttribute(silverPositionsArray, 3));

    const goldStartPositions: THREE.Vector3[] = [];
    const goldPositionsArray = new Float32Array(goldTargets.length * 3);

    for (let i = 0; i < goldTargets.length; i++) {
      const rx = (Math.random() - 0.5) * 8.5;
      const ry = (Math.random() - 0.5) * 8.5;
      const rz = (Math.random() - 0.5) * 4.0;
      goldStartPositions.push(new THREE.Vector3(rx, ry, rz));

      goldPositionsArray[i * 3] = rx;
      goldPositionsArray[i * 3 + 1] = ry;
      goldPositionsArray[i * 3 + 2] = rz;
    }

    const goldGeometry = new THREE.BufferGeometry();
    goldGeometry.setAttribute("position", new THREE.BufferAttribute(goldPositionsArray, 3));

    // Sharp square pixel canvas texture
    const pCanvas = createPixelTexture();
    let pTexture: THREE.CanvasTexture | null = null;
    let silverPixelMaterial: THREE.PointsMaterial;
    let goldPixelMaterial: THREE.PointsMaterial;

    if (pCanvas) {
      pTexture = new THREE.CanvasTexture(pCanvas);
      silverPixelMaterial = new THREE.PointsMaterial({
        size: 0.10,
        map: pTexture,
        transparent: true,
        blending: THREE.NormalBlending,
        color: 0xdddddd,
        depthWrite: false,
        opacity: 1
      });
      goldPixelMaterial = new THREE.PointsMaterial({
        size: 0.10,
        map: pTexture,
        transparent: true,
        blending: THREE.NormalBlending,
        color: 0xf5bf42,
        depthWrite: false,
        opacity: 1
      });
    } else {
      silverPixelMaterial = new THREE.PointsMaterial({
        size: 0.10,
        transparent: true,
        color: 0xdddddd,
        opacity: 1
      });
      goldPixelMaterial = new THREE.PointsMaterial({
        size: 0.10,
        transparent: true,
        color: 0xf5bf42,
        opacity: 1
      });
    }

    const silverPixelPoints = new THREE.Points(silverGeometry, silverPixelMaterial);
    const goldPixelPoints = new THREE.Points(goldGeometry, goldPixelMaterial);

    logoGroup.add(silverPixelPoints);
    logoGroup.add(goldPixelPoints);

    // --- GSAP Timeline Assembly ---
    const animState = { progress: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          onComplete();
        }, 0);
      }
    });

    // 1. Assemble pixels
    tl.to(animState, {
      progress: 1.0,
      duration: 1.75,
      ease: "power2.inOut"
    }, 0.1);

    // 2. Crystallization Transition
    tl.set(solidMeshes, { visible: true }, 1.35);

    tl.fromTo([meshV.scale, meshLeftStem.scale, meshRightStem.scale],
      { x: 0.1, y: 0.1, z: 0.1 },
      { x: 1.0, y: 1.0, z: 1.0, duration: 0.85, ease: "back.out(1.5)" },
      1.35
    );

    tl.to([goldMaterial, silverMaterial], { opacity: 1, duration: 0.6, ease: "power2.out" }, 1.35);
    tl.to([goldPixelMaterial, silverPixelMaterial], { opacity: 0, duration: 0.6, ease: "power2.out" }, 1.35);

    // Fade in text overlay container (its children are initially opacity 0)
    tl.to(textRef.current, { opacity: 1, duration: 0.1 }, 2.1);

    // Type "WELCOME TO" letter by letter
    tl.to(".welcome-char", {
      opacity: 1,
      duration: 0.03,
      stagger: 0.04,
      ease: "none"
    }, 2.1);

    // Type "YARi" letters sequentially
    // Fade in the YARi logo image
    tl.fromTo(".yari-logo",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      2.5
    );

    // Face the front of the screen perfectly (0 base tilt)
    logoGroup.rotation.set(0, 0, 0);

    // Core point light flare on completion
    tl.to(hubLight, { intensity: 2.2, distance: 12, duration: 1.8 }, 1.1);

    // --- Exit Zoom Sequence ---
    tl.add(() => {
      onActiveReveal();
    }, 3.5);

    tl.to(logoGroup.position, {
      z: 5.0,
      duration: 1.2,
      ease: "power2.in"
    }, 3.5);

    tl.to(logoGroup.scale, {
      x: 1.9,
      y: 1.9,
      z: 1.9,
      duration: 1.2,
      ease: "power2.in"
    }, 3.5);

    // Fade out text overlay during zoom
    tl.to(textRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.6,
      ease: "power2.in"
    }, 3.5);

    // Fade down materials and light intensity
    const fadeList: any[] = [goldMaterial, silverMaterial, hubLight];
    if (goldTexture) fadeList.push(goldTexture);
    if (silverTexture) fadeList.push(silverTexture);

    tl.to(fadeList, {
      opacity: 0,
      intensity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    }, 3.6);

    // Fade preloader container wrapper
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 1.0,
      ease: "power2.inOut"
    }, 3.7);

    // --- Animation Rendering Loop ---
    let frameId: number;
    let time = 0;

    const tick = () => {
      time += 0.015;

      // 1. Hover breathing drift (tilted up by 0.95 to prevent text overlap)
      logoGroup.position.y = 0.95 + Math.sin(time * 1.2) * 0.08;

      // 2. Interactive Parallax Tilt & Auto-wobble
      const autoWobbleX = Math.sin(time * 0.5) * 0.04;
      const autoWobbleY = Math.cos(time * 0.5) * 0.04;

      // Perfectly flat rest state, tilting only slightly on mouse interaction
      const targetRotX = 0.0 + (mouse.y * 0.15) + autoWobbleX;
      const targetRotY = (mouse.x * 0.15) + autoWobbleY;

      // Smooth interpolation (lerp)
      logoGroup.rotation.x += (targetRotX - logoGroup.rotation.x) * 0.08;
      logoGroup.rotation.y += (targetRotY - logoGroup.rotation.y) * 0.08;
      logoGroup.rotation.z += (0 - logoGroup.rotation.z) * 0.08;

      // 3. Rotate lights to slide specular highlights
      frontKeyLight.position.x = 2 * Math.sin(time);
      frontKeyLight.position.y = 1 + 2 * Math.cos(time);

      dirLight1.position.x = 5 * Math.sin(time);
      dirLight1.position.y = 5 * Math.cos(time);
      dirLight2.position.x = -5 * Math.sin(time * 0.4);
      dirLight2.position.y = 5 * Math.cos(time * 0.4);

      // 4. Swarming pixel animation (incorporating Y offset in target positions)
      if (silverGeometry && goldGeometry && animState) {
        const progress = animState.progress;
        const waveDecay = (1.0 - progress);
        const spiralAngle = time * 2.8 * waveDecay;
        const cosA = Math.cos(spiralAngle);
        const sinA = Math.sin(spiralAngle);

        // Update silver points
        const silverPos = silverGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < silverTargets.length; i++) {
          const startX = silverStartPositions[i].x;
          const startY = silverStartPositions[i].y;
          const startZ = silverStartPositions[i].z;

          const targetX = silverTargets[i].x;
          const targetY = silverTargets[i].y;
          const targetZ = silverTargets[i].z;

          const rotatedX = startX * cosA - startY * sinA;
          const rotatedY = startX * sinA + startY * cosA;

          let currentX = rotatedX + (targetX - rotatedX) * progress;
          let currentY = rotatedY + (targetY - rotatedY) * progress;
          let currentZ = startZ + (targetZ - startZ) * progress;

          const waveDecayAmp = waveDecay * 1.3;
          currentX += Math.sin(time * 3.5 + startY) * waveDecayAmp;
          currentY += Math.cos(time * 3.5 + startX) * waveDecayAmp;

          silverPos[i * 3] = currentX;
          silverPos[i * 3 + 1] = currentY;
          silverPos[i * 3 + 2] = currentZ;
        }
        silverGeometry.attributes.position.needsUpdate = true;

        // Update gold points
        const goldPos = goldGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < goldTargets.length; i++) {
          const startX = goldStartPositions[i].x;
          const startY = goldStartPositions[i].y;
          const startZ = goldStartPositions[i].z;

          const targetX = goldTargets[i].x;
          const targetY = goldTargets[i].y;
          const targetZ = goldTargets[i].z;

          const rotatedX = startX * cosA - startY * sinA;
          const rotatedY = startX * sinA + startY * cosA;

          let currentX = rotatedX + (targetX - rotatedX) * progress;
          let currentY = rotatedY + (targetY - rotatedY) * progress;
          let currentZ = startZ + (targetZ - startZ) * progress;

          const waveDecayAmp = waveDecay * 1.3;
          currentX += Math.sin(time * 3.5 + startY) * waveDecayAmp;
          currentY += Math.cos(time * 3.5 + startX) * waveDecayAmp;

          goldPos[i * 3] = currentX;
          goldPos[i * 3 + 1] = currentY;
          goldPos[i * 3 + 2] = currentZ;
        }
        goldGeometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // --- Cleanup Routine ---
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);

      scene.remove(parentGroup);
      scene.remove(ambientLight);
      scene.remove(frontKeyLight);
      scene.remove(dirLight1);
      scene.remove(dirLight2);
      scene.remove(topLight);
      scene.remove(bottomLight);
      scene.remove(hubLight);

      geomV.dispose();
      geomLeftStem.dispose();
      geomRightStem.dispose();
      goldMaterial.dispose();
      silverMaterial.dispose();
      if (goldTexture) goldTexture.dispose();
      if (silverTexture) silverTexture.dispose();
      if (envTexture) envTexture.dispose();

      silverGeometry.dispose();
      goldGeometry.dispose();
      silverPixelMaterial.dispose();
      goldPixelMaterial.dispose();
      if (pTexture) pTexture.dispose();

      logoGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
        if (child instanceof THREE.Points) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, { scope: containerRef, dependencies: [onActiveReveal, onComplete] });

  // CSS gradients for silver and gold typography matching the logo
  const silverStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #b0b0b0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  };

  const goldStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #a67c1e 0%, #c59b35 50%, #5c3a00 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#050508] flex flex-col items-center justify-center overflow-hidden pointer-events-auto"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />

      {/* Welcome to YARi Text Overlay */}
      <div
        ref={textRef}
        className="absolute bottom-[20%] flex flex-col items-center gap-3 pointer-events-none select-none z-10 opacity-0"
      >
        <span className="text-sm md:text-base font-sans tracking-[0.5em] text-[#8e9aa8] uppercase flex justify-center">
          {"WELCOME TO".split("").map((char, index) => (
            <span key={index} className="welcome-char opacity-0 inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
        <img 
          src="/yari-logo-text.png" 
          alt="YARI"
          className="yari-logo opacity-0 h-9 sm:h-11 md:h-[48px] w-auto object-contain select-none" 
          draggable={false}
        />
      </div>
    </div>
  );
}
