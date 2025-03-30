'use client'; // Add this at the top to mark as a Client Component

import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the Three.js component with no SSR
const ThreeBackground = dynamic(() => import('@/components/ui/polymind/ThreeBackground'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Three.js Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <ThreeBackground />
      </div>
      
      {/* Content */}
      <div className="z-10 flex flex-col items-center gap-8">
        <div className="text-blue-300 text-[5rem] md:text-[8rem] font-bold">
          PolyMind
        </div>
        
        <div className="text-blue-300 text-xl md:text-2xl mb-8">
          Multi Agent Intelligence
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-all">
            <span className="material-icons">bolt</span>
            Get Started
          </Link>
          
          <Link href="/explore" className="border border-blue-500 text-blue-400 hover:bg-blue-900/30 py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-all">
            <span className="material-icons">language</span>
            Explore Languages
          </Link>
        </div>
      </div>
    </main>
  );
}
