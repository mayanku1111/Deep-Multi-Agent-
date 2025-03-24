import Image from "next/image";

export default function Home() {
  return (
    
      <main className="min-h-screen w-full flex flex-col items-center justify-start gap-8 py-16">

        <div className="flex flex-col items-center gap-4">
          <h1 className="text-8xl font-bold italic bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm hover:drop-shadow-md transition-all duration-300 tracking-tight ">Research Agent</h1>
          <p>
            Enter a topic and answer a few questions to generate a research report.
          </p>
        </div>
        
      </main>
  );
}
