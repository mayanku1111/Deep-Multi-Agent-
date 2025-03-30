'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the Three.js component with no SSR
const ThreeBackground = dynamic(() => import('@/components/ui/polymind/ThreeBackground'), {
  ssr: false,
});

export default function ExplainPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Three.js Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <ThreeBackground />
      </div>
      
      {/* Content */}
      <div className="z-10 bg-black/30 backdrop-blur-lg p-8 rounded-lg border border-green-500/30 w-full max-w-2xl text-center">
        <div className="text-5xl mb-4">👶</div>
        <h1 className="text-green-300 text-3xl font-bold mb-4">Explain Like I'm 5</h1>
        <p className="text-green-200/70 mb-8">
          This agent helps simplify complex topics into easy-to-understand explanations.
        </p>
        <div className="text-white/70 mb-8">
          Feature coming soon! This agent interface is under development.
        </div>
        
        <Link 
          href="/agents" 
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
        >
          <span className="material-icons">arrow_back</span>
          Back to Agents
        </Link>
      </div>
    </main>
  );
} 