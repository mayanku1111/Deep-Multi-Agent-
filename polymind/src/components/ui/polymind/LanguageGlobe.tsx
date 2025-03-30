'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Language {
  code: string;
  name: string;
  native: string;
}

interface LanguageGlobeProps {
  languages: Language[];
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
}

// Language marker component
const LanguageMarker = ({ 
  language, 
  position, 
  isSelected, 
  onClick 
}: { 
  language: Language; 
  position: [number, number, number]; 
  isSelected: boolean;
  onClick: () => void;
}) => {
  const markerRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ camera }) => {
    if (markerRef.current) {
      // Make text face the camera
      markerRef.current.quaternion.copy(camera.quaternion);
    }
  });
  
  return (
    <group 
      ref={markerRef} 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Marker dot */}
      <mesh position={[0, 0, 0.1]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial 
          color={isSelected ? "#3b82f6" : (hovered ? "#60a5fa" : "#93c5fd")} 
        />
      </mesh>
      
      {/* Language text */}
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.1}
        color={isSelected ? "#ffffff" : (hovered ? "#e0e7ff" : "#bfdbfe")}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        {language.name}
      </Text>
    </group>
  );
};

// Main globe component
const Globe = ({ 
  languages, 
  selectedLanguage,
  onSelectLanguage
}: LanguageGlobeProps) => {
  const globeRef = useRef<THREE.Mesh>(null);
  
  // Generate random but consistent positions for languages on the globe
  const getLanguagePosition = (index: number, total: number): [number, number, number] => {
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    
    return [
      1.2 * Math.cos(theta) * Math.sin(phi),
      1.2 * Math.sin(theta) * Math.sin(phi),
      1.2 * Math.cos(phi)
    ];
  };
  
  // Animation loop for globe rotation
  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group>
      {/* The globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color="#1e3a8a"
          metalness={0.2}
          roughness={0.7}
          emissive="#0f172a"
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>
      
      {/* Language markers */}
      {languages.map((language, index) => (
        <LanguageMarker
          key={language.code}
          language={language}
          position={getLanguagePosition(index, languages.length)}
          isSelected={language.code === selectedLanguage}
          onClick={() => onSelectLanguage(language.code)}
        />
      ))}
    </group>
  );
};

// Main component
const LanguageGlobe: React.FC<LanguageGlobeProps> = ({ 
  languages, 
  selectedLanguage,
  onSelectLanguage
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.3} />
        <Globe 
          languages={languages} 
          selectedLanguage={selectedLanguage}
          onSelectLanguage={onSelectLanguage}
        />
      </Canvas>
    </div>
  );
};

export default LanguageGlobe; 