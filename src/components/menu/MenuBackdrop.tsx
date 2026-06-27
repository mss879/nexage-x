"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * WebGL backdrop for the fullscreen menu — a slow flowing orange/black plasma
 * (domain-warped fbm noise) with a pointer-reactive glow. Mounted only while the
 * menu is open; disposes all GPU resources on unmount.
 */
export default function MenuBackdrop() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const setSize = () => renderer.setSize(mount.clientWidth, mount.clientHeight);
    setSize();
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // u_res must be in the same units as gl_FragCoord — i.e. drawing-buffer
    // (device) pixels, not CSS pixels — otherwise the shader's vignette clips.
    const uniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_target: { value: new THREE.Vector2(0.5, 0.5) },
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
        uniform vec2 u_mouse;
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
          for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
          return v;
        }
        void main(){
          vec2 p = (gl_FragCoord.xy - 0.5 * u_res.xy) / u_res.y;
          float t = u_time * 0.05;

          vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + vec2(5.2, 1.3) - t));
          vec2 r = vec2(fbm(p * 1.6 + 1.4 * q + vec2(1.7, 9.2) + 0.12 * t),
                        fbm(p * 1.6 + 1.4 * q + vec2(8.3, 2.8) - 0.10 * t));
          float f = fbm(p * 1.6 + 1.6 * r);

          vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0) * 2.0;
          float d = distance(p, m);
          float glow = smoothstep(1.25, 0.0, d);

          vec3 base   = vec3(0.020, 0.020, 0.031);
          vec3 deep   = vec3(0.32, 0.11, 0.0);
          vec3 orange = vec3(0.874, 0.513, 0.149);

          vec3 col = base;
          col = mix(col, deep,   clamp(f * f * 1.9, 0.0, 1.0));
          col = mix(col, orange, clamp(pow(max(f, 0.0), 3.0) * 1.5 + glow * 0.45, 0.0, 1.0));
          col += orange * glow * 0.22;

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

    const onMove = (e: PointerEvent) => {
      uniforms.u_target.value.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight,
      );
    };
    window.addEventListener("pointermove", onMove);

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      uniforms.u_time.value = clock.getElapsedTime();
      // ease the pointer for a liquid feel
      uniforms.u_mouse.value.lerp(uniforms.u_target.value, 0.06);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      renderer.render(scene, camera);
    } else {
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
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
