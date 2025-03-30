'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Define types for the PlanetSphere props
interface PlanetSphereProps {
  position: [number, number, number];
  color: string;
  size?: number;
  rotation?: number;
}

// Animated floating sphere representing a celestial body
const PlanetSphere = ({ position, color, size = 1, rotation = 0.001 }: PlanetSphereProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += rotation * 0.5;
      mesh.current.rotation.y += rotation;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
};

// Main Three.js scene
const Scene = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useFrame(({ clock }) => {
    if (cameraRef.current) {
      // Subtle camera movement to create a floating effect
      const t = clock.getElapsedTime() * 0.1;
      cameraRef.current.position.x = Math.sin(t) * 0.5;
      cameraRef.current.position.y = Math.cos(t) * 0.3;
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 0, 10]}
        fov={60}
      />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.1} />
      
      {/* Main directional light */}
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      
      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      {/* Dark planet in the distance */}
      <PlanetSphere 
        position={[20, -10, -40]} 
        color="#0c1f3d" 
        size={15} 
        rotation={0.0001}
      />
      
      {/* Create a subtle glow in the background */}
      <mesh position={[15, -5, -30]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color="#1a4b8f" transparent opacity={0.1} />
      </mesh>
    </>
  );
};

const ThreeBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full bg-[#020818]">
      <Canvas>
        <Scene />
      </Canvas>
    </div>
  );
};

export default ThreeBackground; 