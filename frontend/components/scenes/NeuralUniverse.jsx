"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Stars } from "@react-three/drei";
import * as THREE from "three";
import { usePerformanceTier, TIER_PARTICLES, TIER_LINES, TIER_DPR } from "@/lib/usePerformanceTier";

// ─── Retail category nodes ────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Electronics",    color: "#22d3ee", radius: 3.2, speed: 0.28, size: 0.22 },
  { name: "Apparel",        color: "#e879f9", radius: 2.4, speed: 0.38, size: 0.18 },
  { name: "Home & Kitchen", color: "#34d399", radius: 4.0, speed: 0.20, size: 0.16 },
  { name: "Accessories",    color: "#8b5cf6", radius: 1.8, speed: 0.50, size: 0.14 },
  { name: "Beauty",         color: "#f59e0b", radius: 3.6, speed: 0.24, size: 0.15 },
  { name: "Sports",         color: "#fb7185", radius: 2.8, speed: 0.34, size: 0.13 },
  { name: "Footwear",       color: "#a5f3fc", radius: 4.8, speed: 0.18, size: 0.12 },
];

// ─── Central AI Orb ───────────────────────────────────────────────────────────
function CentralOrb() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useFrame((_, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.15;
      outerRef.current.rotation.x += delta * 0.08;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.22;
      innerRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.5} />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshBasicMaterial color="#a5f3fc" transparent opacity={0.85} />
      </mesh>
      <pointLight color="#22d3ee" intensity={4} distance={8} decay={2} />
    </group>
  );
}

// ─── Orbiting Product Node ────────────────────────────────────────────────────
function ProductNode({ category, index }) {
  const meshRef = useRef(null);
  const phase   = useRef(index * 1.3);

  const color = useMemo(() => new THREE.Color(category.color), [category.color]);

  useFrame((_, delta) => {
    phase.current += delta * category.speed;
    const inclination = (index / CATEGORIES.length) * Math.PI * 0.75 - 0.35;
    const x = category.radius * Math.cos(phase.current) * Math.cos(inclination);
    const y = category.radius * Math.sin(inclination) * 0.8;
    const z = category.radius * Math.sin(phase.current) * Math.cos(inclination);

    if (meshRef.current) {
      meshRef.current.position.set(x, y, z);
      const pulse = 1 + Math.sin(phase.current * 3) * 0.12;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[category.size, 10, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
}

// ─── Orbital Ring ─────────────────────────────────────────────────────────────
function OrbitalRing({ radius, color, tiltX, speed }) {
  const lineRef = useRef(null);

  const points = useMemo(() => {
    const pts = [];
    const segs = 96;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  const geo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(points),
    [points]
  );

  const mat = useMemo(
    () => new THREE.LineBasicMaterial({ color, opacity: 0.1, transparent: true }),
    [color]
  );

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  useFrame((_, delta) => {
    if (lineRef.current) {
      lineRef.current.rotation.x = tiltX;
      lineRef.current.rotation.y += delta * speed * 0.08;
    }
  });

  return <line ref={lineRef} geometry={geo} material={mat} />;
}

// ─── Background point cloud ───────────────────────────────────────────────────
function NeuralPoints({ count }) {
  const ref = useRef(null);

  const { positions, colors } = useMemo(() => {
    const pos  = new Float32Array(count * 3);
    const col  = new Float32Array(count * 3);
    const pal  = [[0.13,0.83,0.93],[0.91,0.47,0.98],[0.54,0.36,0.96],[0.97,0.98,0.99]];
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      const c = pal[i % pal.length];
      col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
    }
    return { positions: pos, colors: col };
  }, [count]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(colors,    3));
    return g;
  }, [positions, colors]);

  const mat = useMemo(
    () => new THREE.PointsMaterial({ size: 0.045, vertexColors: true, opacity: 0.55, transparent: true }),
    []
  );

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.012;
      ref.current.rotation.x += delta * 0.005;
    }
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

// ─── Camera (auto-orbit + mouse parallax) ────────────────────────────────────
function CameraController() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", h, { passive: true });
    return () => window.removeEventListener("mousemove", h);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const tx = Math.sin(t * 0.07) * 1.6 + mouse.current.x * 0.8;
    const ty = 1.5 + (-mouse.current.y) * 0.5;
    const tz = 10 + Math.cos(t * 0.07) * 1.2;

    camera.position.x += (tx - camera.position.x) * 0.022;
    camera.position.y += (ty - camera.position.y) * 0.022;
    camera.position.z += (tz - camera.position.z) * 0.022;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function NeuralScene({ tier }) {
  const count = TIER_PARTICLES[tier];
  const showLines = TIER_LINES[tier];
  const nodeCount = tier === "low" ? 4 : 7;

  return (
    <>
      <CameraController />
      <color attach="background" args={["#02040b"]} />
      <fog attach="fog" args={["#02040b", 12, 26]} />

      <Stars radius={28} depth={18} count={tier === "high" ? 700 : 250} factor={2} fade speed={0.3} />

      <NeuralPoints count={count} />

      {CATEGORIES.slice(0, nodeCount).map((cat, i) => (
        <OrbitalRing
          key={i}
          radius={cat.radius}
          color={cat.color}
          tiltX={0.25 + i * 0.08}
          speed={cat.speed}
        />
      ))}

      <CentralOrb />

      {CATEGORIES.slice(0, nodeCount).map((cat, i) => (
        <ProductNode key={cat.name} category={cat} index={i} />
      ))}

      <ambientLight intensity={0.07} />
      <pointLight position={[8,  4, 6]} color="#22d3ee" intensity={0.5} distance={20} />
      <pointLight position={[-6,-3,-8]} color="#e879f9" intensity={0.4} distance={20} />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function NeuralUniverse({ className = "" }) {
  const tier = usePerformanceTier();
  const dpr  = TIER_DPR[tier];

  return (
    <div
      className={`neural-universe-wrap ${className}`}
      aria-hidden="true"
      // CSS bloom — cheaper than postprocessing, still beautiful
      style={{ filter: tier === "low" ? "none" : "brightness(1.08) contrast(1.02)" }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 10], fov: 60 }}
        dpr={dpr}
        gl={{ antialias: tier !== "low", powerPreference: "high-performance", alpha: false }}
        frameloop="always"
      >
        <NeuralScene tier={tier} />
      </Canvas>
    </div>
  );
}
