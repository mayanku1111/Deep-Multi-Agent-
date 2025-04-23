export interface CulturalSource {
  title: string;
  description: string;
  image?: string;
  url?: string;
  origin?: string; // e.g., "chromadb", "web"
  similarity: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources: CulturalSource[];
} 