'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Message, CulturalSource } from '@/types/cultural';

// Dynamically import the Three.js background with no SSR
const ThreeBackground = dynamic(() => import('@/components/ui/polymind/ThreeBackground'), {
  ssr: false,
});

export default function CulturalPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Cultural Lens agent. I can explore cultural concepts, traditions, artwork, and more. How can I help you today?',
      sources: []
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      sources: []
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call API endpoint
      const response = await fetch('/api/cultural-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          history: messages
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add assistant message with any retrieved sources
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.text,
        sources: data.sources || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        sources: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden">
      {/* Three.js Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <ThreeBackground />
      </div>
      
      {/* Header */}
      <div className="w-full p-4 flex justify-between items-center z-10 bg-black/40 backdrop-blur-sm">
        <Link 
          href="/agents" 
          className="flex items-center gap-2 text-purple-300 hover:text-purple-100"
        >
          <span className="material-icons">arrow_back</span>
          Back to Agents
        </Link>
        <h1 className="text-purple-300 text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🌎</span> Cultural Lens
        </h1>
        <div className="w-[100px]"></div> {/* Spacer for centering */}
      </div>
      
      {/* Chat Container */}
      <div className="flex-1 w-full max-w-4xl p-4 overflow-y-auto flex flex-col gap-4 my-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`${
              message.role === 'user' 
                ? 'bg-blue-600/30 ml-auto' 
                : 'bg-purple-600/30 mr-auto'
            } backdrop-blur-md p-4 rounded-lg max-w-[80%] border border-white/10`}
          >
            <div 
              className="text-white mb-2"
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
            
            {/* Sources/Images Section */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs text-purple-300 mb-2">Cultural References:</div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {message.sources.map((source, idx) => (
                    <div key={idx} className="min-w-[150px] max-w-[200px] flex-shrink-0">
                      {source.image && (
                        <div className="relative h-[120px] w-full mb-1 bg-black/50 rounded overflow-hidden">
                          <Image 
                            src={source.image} 
                            alt={source.title || 'Cultural image'} 
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="text-xs text-purple-200 font-medium">{source.title}</div>
                      {source.description && (
                        <div className="text-[10px] text-purple-200/70">{source.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-purple-600/30 backdrop-blur-md p-4 rounded-lg max-w-[80%] mr-auto border border-white/10">
            <div className="flex items-center gap-2">
              <div className="animate-pulse flex space-x-1">
                <div className="h-2 w-2 bg-purple-300 rounded-full"></div>
                <div className="h-2 w-2 bg-purple-300 rounded-full"></div>
                <div className="h-2 w-2 bg-purple-300 rounded-full"></div>
              </div>
              <span className="text-purple-300 text-sm">Exploring cultural perspectives...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <div className="w-full max-w-4xl p-4 bg-black/40 backdrop-blur-md border-t border-white/10 z-10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cultural traditions, art, history..."
            className="flex-1 bg-white/10 text-white border border-purple-500/30 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="material-icons animate-spin text-xl">refresh</span>
            ) : (
              <span className="material-icons text-xl">send</span>
            )}
          </button>
        </form>
        <div className="mt-2 text-xs text-center text-purple-300/70">
          Search cultural concepts, traditions, and artifacts from around the world
        </div>
      </div>
    </main>
  );
} 