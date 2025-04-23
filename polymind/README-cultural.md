# Cultural Lens Agent for PolyMind

The Cultural Lens agent is an AI assistant that helps users explore cultural concepts, traditions, artifacts, and historical perspectives from around the world. It uses a combination of LLM-based knowledge, ChromaDB vector database with CLIP embeddings, and web search capabilities to provide comprehensive cultural insights.

## Features

- **Multimodal Cultural Understanding**: Analyzes both text queries and visual cultural artifacts
- **ChromaDB Integration**: Uses a vector database of cultural concepts with CLIP embeddings
- **Visual Response**: Returns relevant cultural images alongside text responses
- **Diverse Perspectives**: Provides multiple cultural viewpoints and historical contexts
- **LangChain Agent Architecture**: Leverages agent-based reasoning for complex cultural analysis

## Technical Architecture

1. **Frontend**: React-based chat interface built with Next.js
2. **Backend**: Next.js API routes using LangChain agents
3. **Vector Database**: ChromaDB with CLIP embeddings for cultural images
4. **LLM**: OpenRouter API integration for access to various language models
5. **Image Processing**: Serves and caches dataset images

## Installation

1. Make sure all dependencies are installed:
   ```
   npm install
   ```

2. Set up your environment variables in `.env.local`:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key
   LLM_MODEL=anthropic/claude-3-opus-20240229
   CHROMA_DB_PATH=./chroma_db
   APP_URL=http://localhost:3000
   ```

3. Run the ChromaDB setup script to create the cultural image database:
   ```
   python polymind/dataset/chroma.py
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Navigate to `/cultural` route in your browser
2. The chat interface will greet you with a welcome message
3. Ask questions about any cultural topic, artifact, tradition, or historical perspective
4. The agent will respond with relevant information and may include cultural images
5. You can explore topics like:
   - "Tell me about traditional Japanese tea ceremonies"
   - "What are the cultural significances of dragons in different parts of the world?"
   - "Show me examples of traditional wedding attire across cultures"
   - "How does storytelling vary across different cultural traditions?"

## Data Sources

The system uses the "multimodal-cultural-concepts" dataset, which contains a collection of culturally relevant images. These images are embedded using CLIP and stored in ChromaDB for semantic search and retrieval.

## Implementation Details

- The frontend components are in `src/app/cultural/page.tsx`
- API endpoints:
  - `/api/cultural-agent` - Main agent endpoint for handling queries
  - `/api/cultural-images/[id]` - Endpoint for serving images from the dataset
- Types are defined in `src/types/cultural.ts` 