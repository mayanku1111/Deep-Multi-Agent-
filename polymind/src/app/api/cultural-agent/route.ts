import { NextResponse } from 'next/server';
import { ChromaClient } from 'chromadb';
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { SentenceTransformerEmbeddings } from 'langchain/embeddings/sentence_transformer';
import { ChainTool, AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, AIMessage } from 'langchain/schema';
import { Message, CulturalSource } from '@/types/cultural';

// Initialize ChromaDB client
const initChromaDB = async () => {
  try {
    const client = new ChromaClient({ path: process.env.CHROMA_DB_PATH || './chroma_db' });
    const collection = await client.getCollection({ name: "cultural_images" });
    return collection;
  } catch (error) {
    console.error('Error initializing ChromaDB:', error);
    return null;
  }
};

// Initialize LLM
const initLLM = () => {
  return new ChatOpenAI({
    temperature: 0.7,
    modelName: process.env.LLM_MODEL || 'anthropic/claude-3-opus-20240229',
    openAIApiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'https://polymind.ai',
        'X-Title': 'PolyMind Cultural Lens',
      },
    },
  });
};

// Text embedding model
const embeddings = new SentenceTransformerEmbeddings({
  modelName: "sentence-transformers/clip-ViT-B-32",
});

export async function POST(request: Request) {
  try {
    const { query, history } = await request.json();
    
    // Initialize models and DB
    const llm = initLLM();
    const chromaCollection = await initChromaDB();
    
    // Convert message history to LangChain format
    const messageHistory = history.map((msg: Message) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });
    
    // Search for relevant cultural images
    let culturalSources: CulturalSource[] = [];
    
    if (chromaCollection) {
      try {
        // Embed the query
        const queryEmbedding = await embeddings.embedQuery(query);
        
        // Search ChromaDB
        const results = await chromaCollection.query({
          queryEmbeddings: [queryEmbedding],
          nResults: 3,
          includeMetadata: true,
        });
        
        // Format results
        if (results.ids[0]) {
          culturalSources = results.ids[0].map((id, idx) => {
            const metadata = results.metadatas?.[0]?.[idx] || {};
            return {
              title: `Cultural Image ${id}`,
              description: metadata.label || 'Cultural concept',
              image: `/api/cultural-images/${id}`, // Endpoint to serve the image
              origin: 'chromadb',
              similarity: results.distances?.[0]?.[idx]
            };
          });
        }
      } catch (error) {
        console.error('Error querying ChromaDB:', error);
      }
    }
    
    // Define cultural agent tools
    const searchCulturalConceptsTool = new ChainTool({
      name: "search_cultural_concepts",
      description: "Search for cultural concepts, traditions, and artifacts",
      chain: new LLMChain({
        llm,
        prompt: PromptTemplate.fromTemplate(
          `You are a cultural expert. The user is asking about: "{query}".
          Provide rich cultural context, historical background, and diverse perspectives.
          Include information about cultural traditions, artifacts, or concepts that relate to this query.
          Be respectful and educational in your response.
          
          Query: {query}
          Cultural knowledge: `
        ),
      }),
    });
    
    // Create agent with tools
    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools: [searchCulturalConceptsTool],
      prompt: PromptTemplate.fromTemplate(
        `You are a Cultural Lens AI assistant that helps users explore diverse cultural perspectives, 
        traditions, artifacts, and historical contexts.
        
        Your goal is to provide rich, educational information about cultural topics while being 
        respectful of all traditions and perspectives.
        
        When responding, consider:
        1. Multiple cultural viewpoints
        2. Historical context and evolution
        3. Regional variations
        4. Significance in different communities
        
        Current conversation:
        {chat_history}
        
        Human: {input}
        AI: `
      ),
    });
    
    const agentExecutor = new AgentExecutor({
      agent,
      tools: [searchCulturalConceptsTool],
      verbose: true,
    });
    
    // Run the agent
    const result = await agentExecutor.invoke({
      input: query,
      chat_history: messageHistory,
    });
    
    // Return the combined response
    return NextResponse.json({
      text: result.output,
      sources: culturalSources
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 