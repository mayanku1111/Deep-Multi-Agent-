'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the Three.js component with no SSR
const ThreeBackground = dynamic(() => import('@/components/ui/polymind/ThreeBackground'), {
  ssr: false,
});

// Language globe component
const LanguageGlobe = dynamic(() => import('@/components/ui/polymind/LanguageGlobe'), {
  ssr: false,
});

// Language options
interface Language {
  code: string;
  name: string;
  native: string;
}

export default function ExplorePage() {
  const languages: Language[] = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-start p-8 overflow-hidden">
      {/* Three.js Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <ThreeBackground />
      </div>
      
      {/* Header */}
      <div className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-5xl font-bold text-blue-300 mb-4">Explore Languages</h1>
        <p className="text-blue-200/70 text-xl">
          PolyMind agents are available in multiple languages
        </p>
      </div>
      
      {/* Interactive 3D Globe */}
      <div className="w-full h-[300px] mb-12">
        <LanguageGlobe 
          languages={languages} 
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
        />
      </div>
      
      {/* Language Options */}
      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 gap-4">
        {languages.map(lang => (
          <div
            key={lang.code}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selectedLanguage === lang.code 
                ? 'bg-blue-800/50 border border-blue-500'
                : 'bg-blue-900/20 hover:bg-blue-900/30 border border-transparent'
            }`}
            onClick={() => setSelectedLanguage(lang.code)}
          >
            <div className="text-lg font-medium text-white">{lang.name}</div>
            <div className="text-sm text-blue-300">{lang.native}</div>
          </div>
        ))}
      </div>
      
      {/* Continue Button */}
      <div className="mt-12">
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-full flex items-center gap-2"
        >
          <span className="material-icons">translate</span>
          Continue with {languages.find(l => l.code === selectedLanguage)?.name}
        </Link>
      </div>
    </main>
  );
} 