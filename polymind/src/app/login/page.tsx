'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the Three.js component with no SSR
const ThreeBackground = dynamic(() => import('@/components/ui/polymind/ThreeBackground'), {
  ssr: false,
});

// Import a specialized login animation component
const LoginAnimation = dynamic(() => import('@/components/ui/polymind/LoginAnimation'), {
  ssr: false,
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login (in a real app, this would validate with a backend)
    setTimeout(() => {
      setLoading(false);
      // Redirect to the agents selection page after login
      router.push('/agents');
    }, 1500);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Three.js Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <ThreeBackground />
      </div>
      
      {/* Login Panel */}
      <div className="z-10 bg-black/30 backdrop-blur-lg p-8 rounded-lg border border-blue-500/30 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-blue-300 text-3xl font-bold mb-2">PolyMind</h1>
          <p className="text-blue-200/70">Sign in to access multi-agent intelligence</p>
        </div>
        
        {/* Login Animation */}
        <div className="h-32 mb-6">
          <LoginAnimation />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-blue-950/50 border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-blue-950/50 border border-blue-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md ${
              loading 
                ? 'bg-blue-700/50 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium transition-colors`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="text-center mt-4">
            <p className="text-blue-300/70 text-sm">
              Don't have an account?{' '}
              <a href="#" className="text-blue-400 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
} 