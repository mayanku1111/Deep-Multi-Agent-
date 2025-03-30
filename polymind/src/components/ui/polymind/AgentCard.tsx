'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

// Define the Agent interface
interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

interface AgentCardProps {
  agent: Agent;
}

// 3D model for the agent card background
const AgentCardModel = ({ color }: { color: string }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Extract colors from the tailwind gradient class
  const colors = color.split(' ');
  const fromColor = colors[0].replace('from-', '');
  const toColor = colors[1].replace('to-', '');
  
  // Convert Tailwind color names to hex codes (simplified)
  const getTailwindColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      'blue-600': '#2563eb',
      'indigo-800': '#3730a3',
      'green-600': '#16a34a',
      'teal-800': '#115e59',
      'purple-600': '#9333ea',
      'pink-800': '#9d174d',
    };
    
    return colorMap[colorName] || '#4f46e5'; // Default to indigo-600 if not found
  };

  const fromHex = getTailwindColor(fromColor);
  const toHex = getTailwindColor(toColor);
  
  // Animation loop
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      
      // Add subtle "floating" movement
      mesh.current.position.y = Math.sin(clock.getElapsedTime()) * 0.03;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -0.5]}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <MeshDistortMaterial
        color={fromHex}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.4}
      />
    </mesh>
  );
};

// Main agent card component
const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div 
      className="relative h-64 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 3D Background Canvas */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Canvas>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <AgentCardModel color={agent.color} />
        </Canvas>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full bg-black/30 backdrop-blur-sm p-6 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="text-4xl">{agent.icon}</div>
          <div className={`text-white bg-black/50 py-1 px-3 rounded-full text-xs ${hovered ? 'opacity-100' : 'opacity-70'}`}>
            Select Agent
          </div>
        </div>
        
        <div>
          <h2 className="text-white text-2xl font-bold mb-2">{agent.name}</h2>
          <p className="text-white/80 text-sm">{agent.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AgentCard; 