import Image from "next/image";

export default function Home() {
  return (
    
      <main className="min-h-screen w-full flex flex-col items-center justify-start gap-8 py-16">

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-8xl font-bold font-dancing-script italic bg-gradient-to-r from-gray-800 to-violet-800 bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(30,64,175,0.3)] hover:drop-shadow-[0_8px_16px_rgba(76,29,149,0.5)] transition-all duration-300 tracking-tight">Research Agent</h1>
          <p className="text-gray-600 text-center">
            Enter a topic and answer a few questions to generate a research report.
          </p>
        </div>
        
      </main>
  );
}
