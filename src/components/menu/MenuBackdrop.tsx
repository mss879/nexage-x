"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Calm WebGL backdrop for the fullscreen menu — a slow flowing orange/black
 * plasma with a soft, gently drifting ambient glow (no pointer coupling, so it
 * no longer "chases" the mouse). Tuned for performance: capped pixel ratio,
 * no antialias, single-step domain warp, 4-octave fbm, and it pauses when the
 * tab is hidden. Mounted only while the menu is open; disposes GPU resources on
 * unmount.
 */
export default function MenuBackdrop() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    // Keep the fullscreen fragment shader cheap — cap DPR low (lower on touch).
    const maxDpr = coarse ? 1 : 1.25;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    const setSize = () => renderer.setSize(mount.clientWidth, mount.clientHeight);
    setSize();
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_res;
        varying vec2 vUv;

        vec2 hash2(vec2 p){
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }
        float noise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                         dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                     mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                         dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
        }
        float fbm(vec2 p){
          float v = 0.0; float a = 0.5;
          for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
          return v;
        }
        void main(){
          vec2 p = (gl_FragCoord.xy - 0.5 * u_res.xy) / u_res.y;
          float t = u_time * 0.04;

          // Single-step domain warp (cheaper than the previous two-step warp).
          vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 + vec2(5.2, 1.3) - t));
          float f = fbm(p * 1.5 + 1.4 * q);

          // Soft, slowly drifting ambient glow — independent of the pointer.
          vec2 gc = vec2(sin(u_time * 0.12) * 0.22, cos(u_time * 0.09) * 0.14);
          float glow = smoothstep(1.1, 0.0, distance(p, gc));

          vec3 base   = vec3(0.020, 0.020, 0.031);
          vec3 deep   = vec3(0.30, 0.11, 0.0);
          vec3 orange = vec3(0.874, 0.513, 0.149);

          vec3 col = base;
          col = mix(col, deep,   clamp(f * f * 1.8, 0.0, 1.0));
          col = mix(col, orange, clamp(pow(max(f, 0.0), 3.0) * 1.4 + glow * 0.16, 0.0, 1.0));
          col += orange * glow * 0.10;

          float vig = smoothstep(1.55, 0.25, length(p));
          col *= vig;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const onResize = () => {
      setSize();
      uniforms.u_res.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    // Pause the render loop while the tab is hidden (battery / perf friendly).
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running && !reduce) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (reduce) {
      renderer.render(scene, camera);
    } else {
      loop();
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />;
}
