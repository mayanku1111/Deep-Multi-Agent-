'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the Three.js component with no SSR
const ThreeBackground = dynamic(() => import('@/components/ui/polymind/ThreeBackground'), {
  ssr: false,
});

// Agent card component with 3D effect
const AgentCard = dynamic(() => import('@/components/ui/polymind/AgentCard'), {
  ssr: false,
});

// Define agent types
interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

export default function AgentsPage() {
  const router = useRouter();
  
  // Define available agents
  const agents: Agent[] = [
    {
      id: 'research',
      name: 'Deep Research',
      description: 'Conduct comprehensive research on any topic with detailed analysis',
      icon: '🔍',
      color: 'from-blue-600 to-indigo-800',
      route: '/research',  // Changed from '/' to '/research'
    },
    {
      id: 'explain',
      name: 'Explain Like I\'m 5',
      description: 'Simplify complex concepts into easy-to-understand explanations',
      icon: '👶',
      color: 'from-green-600 to-teal-800',
      route: '/explain', // To be implemented
    },
    {
      id: 'cultural',
      name: 'Cultural Lens',
      description: 'Analyze topics from diverse cultural and historical perspectives',
      icon: '🌎',
      color: 'from-purple-600 to-pink-800',
      route: '/cultural', // To be implemented
    }
  ];

  const handleSelectAgent = (agent: Agent) => {
    router.push(agent.route);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-start p-8 overflow-hidden">
      {/* Three.js Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <ThreeBackground />
      </div>
      
      {/* Header */}
      <div className="w-full max-w-6xl mb-12 text-center">
        <h1 className="text-5xl font-bold text-blue-300 mb-4">PolyMind Agents</h1>
        <p className="text-blue-200/70 text-xl">
          Select an AI agent to assist with your specific task
        </p>
      </div>
      
      {/* Agent Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {agents.map(agent => (
          <div key={agent.id} onClick={() => handleSelectAgent(agent)}>
            <AgentCard agent={agent} />
          </div>
        ))}
      </div>
    </main>
  );
} 