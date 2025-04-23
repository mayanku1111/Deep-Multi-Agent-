import { NextResponse } from 'next/server';
import { Message, CulturalSource } from '@/types/cultural';
import fs from 'fs';
import path from 'path';

// Backup mock images in case all retrieval methods fail
const MOCK_IMAGES: CulturalSource[] = [
  {
    title: "Traditional Japanese Tea Ceremony",
    description: "A traditional Japanese tea ceremony (chanoyu) being performed",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "sample",
    similarity: 1.0
  },
  {
    title: "Chinese Dragon Festival",
    description: "Dragon dance performed during Chinese New Year celebrations",
    image: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "sample",
    similarity: 1.0
  },
  {
    title: "Indian Holi Festival",
    description: "Celebration of the Holi festival with colorful powders",
    image: "https://images.unsplash.com/photo-1576089073624-b065946a2b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "sample",
    similarity: 1.0
  },
  {
    title: "Indian Historical Architecture",
    description: "Historic Indian palace from the colonial era",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "sample",
    similarity: 1.0
  }
];

// List of valid OpenRouter model IDs
const VALID_OPENROUTER_MODELS = [
  "google/gemini-pro",
  "google/gemini-1.5-pro-latest",
  "meta-llama/llama-3-70b-instruct",
  "meta-llama/llama-3-8b-instruct",
  "meta-llama/llama-2-70b-chat",
  "mistralai/mistral-large",
  "mistralai/mistral-7b-instruct",
  "openai/gpt-4",
  "openai/gpt-3.5-turbo"
];

// Helper function to convert markdown to HTML
function markdownToHtml(text: string): string {
  if (!text) return '';
  
  // Convert bold markdown (**text**) to <strong> tags
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic markdown (*text*) to <em> tags
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert headers (# Header) to <h> tags
  text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  
  // Convert numbered lists (1. Item) to <ol><li> tags
  text = text.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n)+/g, '<ol>$&</ol>');
  
  // Convert bullet lists (* Item) to <ul><li> tags
  text = text.replace(/^\* (.*$)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
  
  // Convert paragraphs (blank lines between text) to <p> tags
  text = text.replace(/\n\n(.*?)\n\n/g, '<p>$1</p>');
  
  // Make sure there are no double paragraph tags
  text = text.replace(/<p><p>/g, '<p>');
  text = text.replace(/<\/p><\/p>/g, '</p>');
  
  return text;
}

// OpenRouter API integration
async function getOpenRouterResponse(query: string, messages: Message[], context: string = "") {
  try {
    console.log("Calling OpenRouter with API key:", process.env.OPENROUTER_API_KEY ? "Present" : "Missing");
    
    // Format conversation history for the API
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',  // Ensure roles are specifically 'user' or 'assistant'
      content: msg.content
    }));
    
    // Add web search context if available
    let promptContent = query;
    if (context) {
      promptContent = `Query: ${query}\n\nHere's some relevant information from the web:\n${context}\n\nBased on this information, provide a comprehensive and educational response about this cultural topic.`;
    }
    
    // Add the new user query
    formattedMessages.push({
      role: 'user',
      content: promptContent
    });
    
    // Enhanced instructions for better formatting and structure
    // Add a system message with formatting instructions
    formattedMessages.unshift({
      role: 'system',
      content: `You are a Cultural Lens assistant that provides rich, informative responses about cultural topics. 
      When comparing cultures, use clear organization with headers, paragraphs, and lists. 
      Format your response in simple HTML with <h2> tags for main sections, <p> tags for paragraphs, 
      and <ul>/<li> or <ol>/<li> for lists. Don't use markdown formatting like ** or #.`
    });
    
    // If no API key, throw error immediately to use fallback
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is missing");
    }
    
    // Get model from env or use a default valid one
    let modelName = process.env.LLM_MODEL || "meta-llama/llama-4-maverick:free";
    
    // Validate model name is acceptable to OpenRouter
    if (!VALID_OPENROUTER_MODELS.includes(modelName)) {
      console.warn(`Model ${modelName} not in list of known valid models, defaulting to claude-3-haiku`);
      modelName = "meta-llama/llama-4-maverick:free";
    }
    
    console.log(`Using OpenRouter model: ${modelName}`);
    console.log("Sending OpenRouter request with messages:", JSON.stringify(formattedMessages).slice(0, 100) + "...");
    
    // Call OpenRouter API with proper formatting
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'PolyMind Cultural Lens'
      },
      body: JSON.stringify({
        model: modelName,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (${response.status}): ${errorText}`);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText.slice(0, 100)}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected OpenRouter response format:", JSON.stringify(data).slice(0, 200));
      throw new Error("Unexpected response format from OpenRouter");
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return null;
  }
}

// Exa API for web search
async function searchWeb(query: string): Promise<{ content: string, sources: CulturalSource[] }> {
  try {
    if (!process.env.EXA_API_KEY) {
      console.warn("Exa API key missing");
      return { content: "", sources: [] };
    }
    
    const searchQuery = `${query} cultural history traditions`;
    
    // Search web with Exa API
    const searchResponse = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EXA_API_KEY
      },
      body: JSON.stringify({
        query: searchQuery,
        numResults: 5,
        useAutoprompt: true,
        type: "keyword",
        highlights: true,
        includeDomains: ["wikipedia.org", "britannica.com", "history.com", "jstor.org", "nationalgeographic.com"]
      })
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Exa search error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    // Extract content and URLs from search results
    let combinedContent = "";
    const webSources: CulturalSource[] = [];
    
    if (searchData && searchData.results && searchData.results.length > 0) {
      // Build content from search results
      searchData.results.forEach((result: any, idx: number) => {
        // Only include the first 3 results in the context to avoid too much text
        if (idx < 3 && result.text) {
          combinedContent += `[Source: ${result.title}]\n${result.text}\n\n`;
        }
        
        // Add source with image if available
        if (result.imageUrl) {
          webSources.push({
            title: result.title || `Web Result ${idx + 1}`,
            description: result.url || "",
            image: result.imageUrl,
            url: result.url,
            origin: "web",
            similarity: 1.0
          });
        }
      });
    }
    
    return {
      content: combinedContent,
      sources: webSources
    };
  } catch (error) {
    console.error('Error searching the web:', error);
    return { content: "", sources: [] };
  }
}

// Try to retrieve images from ChromaDB if it exists
async function getRelevantImagesFromChromaDB(query: string, maxResults = 3): Promise<CulturalSource[]> {
  try {
    // Import ChromaDB dynamically to avoid breaking the app if not installed
    let ChromaClient;
    try {
      // This will gracefully fail if chromadb isn't installed
      ChromaClient = (await import('chromadb')).ChromaClient;
    } catch (error: any) {
      console.warn('ChromaDB not available:', error.message);
      return [];
    }
    
    // Check if ChromaDB directory exists
    const chromaDBPath = process.env.CHROMA_DB_PATH || './chroma_db';
    if (!fs.existsSync(chromaDBPath)) {
      console.warn(`ChromaDB directory not found at ${chromaDBPath}`);
      return [];
    }
    
    // Initialize ChromaDB client
    const client = new ChromaClient({ path: chromaDBPath });
    
    // Try to get the collection
    try {
      // Note: We're bypassing TypeScript's checking here because the ChromaDB
      // API might have changed between versions
      // @ts-ignore: ChromaDB version differences
      const collection = await client.getCollection({ name: "cultural_images" });
      
      // Directly query the collection without embedding the query
      // This is a simplified approach since we don't have the embedding model
      // @ts-ignore: ChromaDB version differences
      const results = await collection.query({
        nResults: maxResults,
        queryTexts: [query]
      });
      
      // Format results
      if (results && results.ids && results.ids[0]) {
        const formattedResults: CulturalSource[] = [];
        
        for (let i = 0; i < results.ids[0].length; i++) {
          const id = results.ids[0][i];
          const metadata = results.metadatas?.[0]?.[i] || {};
          
          formattedResults.push({
            title: String(metadata.title || `Cultural Image ${id}`),
            description: String(metadata.description || 'Cultural concept'),
            image: `/api/cultural-images/${id}`,
            origin: 'chromadb',
            similarity: Number(results.distances?.[0]?.[i] || 0)
          });
        }
        
        return formattedResults;
      }
    } catch (error: any) {
      console.warn('Error querying ChromaDB collection:', error.message);
    }
    
    return [];
  } catch (error) {
    console.error('Error accessing ChromaDB:', error);
    return [];
  }
}

// Search for images using Unsplash API or fallback to a web search for images
async function searchImages(query: string): Promise<CulturalSource[]> {
  try {
    // Parse query to extract specific cultures for better image results
    const cultures = extractCulturalKeywords(query);
    const searchQueries = cultures.length > 0 
      ? cultures.map(culture => `${culture} culture traditional heritage`)
      : [`${query} culture history traditional`];
    
    const results: CulturalSource[] = [];
    
    // Try to use Unsplash API if available
    if (process.env.UNSPLASH_ACCESS_KEY) {
      for (const searchQuery of searchQueries) {
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=2`,
          {
            headers: {
              'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
          }
        );
        
        if (unsplashResponse.ok) {
          const unsplashData = await unsplashResponse.json();
          
          if (unsplashData.results && unsplashData.results.length > 0) {
            unsplashData.results.forEach((photo: any) => {
              results.push({
                title: photo.description || photo.alt_description || `${searchQuery.split(' ')[0]} culture`,
                description: `Photo by ${photo.user.name} on Unsplash`,
                image: photo.urls.regular,
                url: photo.links.html,
                origin: "unsplash",
                similarity: 1.0
              });
            });
            
            // If we have enough images after each culture, break early
            if (results.length >= 4) break;
          }
        }
      }
      
      if (results.length > 0) {
        return results;
      }
    }
    
    // If no Unsplash API or no results, try Exa API for image search
    try {
      // This is a simplified version - in a real app, you would use a proper image search API
      const exaImageSearch = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXA_API_KEY || ""
        },
        body: JSON.stringify({
          query: `${query} images photos`,
          numResults: 3,
          useAutoprompt: true,
          type: "keyword",
          imageSearch: true
        })
      });
      
      if (exaImageSearch.ok) {
        const imageData = await exaImageSearch.json();
        
        if (imageData && imageData.results) {
          imageData.results.forEach((result: any, idx: number) => {
            if (result.imageUrl) {
              results.push({
                title: result.title || `Image related to ${query}`,
                description: result.url || "Found via web search",
                image: result.imageUrl,
                url: result.url,
                origin: "web",
                similarity: 1.0
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Error searching for images via Exa:', error);
    }
    
    // Return whatever we found
    return results;
  } catch (error) {
    console.error('Error searching for images:', error);
    return [];
  }
}

// Helper function to extract cultural keywords from a query
function extractCulturalKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const culturalKeywords: string[] = [];
  
  // Check for common cultures and countries
  const cultures = [
    'egyptian', 'egypt', 'indian', 'india', 'chinese', 'china', 'japanese', 'japan',
    'african', 'africa', 'european', 'europe', 'american', 'america', 'mexican', 'mexico',
    'brazilian', 'brazil', 'russian', 'russia', 'french', 'france', 'italian', 'italy',
    'spanish', 'spain', 'greek', 'greece', 'roman', 'rome', 'turkish', 'turkey',
    'thai', 'thailand', 'vietnamese', 'vietnam', 'korean', 'korea', 'arabic', 'arab',
    'persian', 'iran', 'iraqi', 'iraq', 'moroccan', 'morocco', 'australian', 'australia',
    'british', 'britain', 'uk', 'scottish', 'scotland', 'irish', 'ireland', 'welsh', 'wales',
    'german', 'germany', 'dutch', 'netherlands', 'swedish', 'sweden', 'norwegian', 'norway',
    'danish', 'denmark', 'finnish', 'finland', 'polish', 'poland', 'hungarian', 'hungary',
    'czech', 'czech republic', 'austrian', 'austria', 'swiss', 'switzerland',
    'canadian', 'canada', 'indonesian', 'indonesia', 'malaysian', 'malaysia',
    'filipino', 'philippines', 'singaporean', 'singapore', 'ukrainian', 'ukraine',
    'bangladeshi', 'bangladesh', 'pakistani', 'pakistan', 'sri lankan', 'sri lanka',
    'nepali', 'nepal', 'bhutanese', 'bhutan', 'mongolian', 'mongolia',
    'tibetan', 'tibet', 'mayan', 'maya', 'aztec', 'inca', 'native american',
    'aboriginal', 'indigenous', 'celtic', 'viking', 'norse', 'polynesian', 'hawaii',
    'maori', 'new zealand', 'zulu', 'xhosa', 'swahili', 'bantu', 'kenyan', 'kenya',
    'nigerian', 'nigeria', 'ghanaian', 'ghana', 'ethiopian', 'ethiopia', 'somali', 'somalia',
    'sudanese', 'sudan', 'egyptian', 'egypt', 'algerian', 'algeria', 'tunisian', 'tunisia',
    'libyan', 'libya', 'south african', 'south africa', 'zimbabwean', 'zimbabwe',
    'cuban', 'cuba', 'jamaican', 'jamaica', 'haitian', 'haiti', 'dominican', 'dominican republic',
    'puerto rican', 'puerto rico', 'colombian', 'colombia', 'venezuelan', 'venezuela',
    'peruvian', 'peru', 'bolivian', 'bolivia', 'chilean', 'chile', 'argentinian', 'argentina',
    'uruguayan', 'uruguay', 'paraguayan', 'paraguay', 'ecuadorian', 'ecuador',
    'byzantine', 'byzantine empire', 'ottoman', 'ottoman empire', 'mughal', 'mughal empire',
    'mesopotamian', 'mesopotamia', 'sumerian', 'sumer', 'babylonian', 'babylon',
    'assyrian', 'assyria', 'hittite', 'anatolian', 'anatolia', 'phoenician', 'phoenicia',
    'brahmin', 'hindu', 'buddhist', 'sikh', 'jain'
  ];
  
  for (const culture of cultures) {
    if (lowerQuery.includes(culture)) {
      // Add the culture without duplicates
      // Normalize culture names (e.g., "egyptian" → "Egypt")
      const normalizedCulture = normalizeCultureName(culture);
      if (!culturalKeywords.includes(normalizedCulture)) {
        culturalKeywords.push(normalizedCulture);
      }
    }
  }
  
  return culturalKeywords;
}

// Helper to normalize culture names for better search results
function normalizeCultureName(culture: string): string {
  // Map adjective forms to proper nouns
  const cultureMap: {[key: string]: string} = {
    'egyptian': 'Egypt',
    'indian': 'India',
    'chinese': 'China',
    'japanese': 'Japan',
    'african': 'Africa',
    'european': 'Europe',
    'american': 'America',
    'mexican': 'Mexico',
    // Add more mappings as needed
    'brahmin': 'Brahmin India',
    'hindu': 'Hindu India',
    'buddhist': 'Buddhist',
    'sikh': 'Sikh India',
    'jain': 'Jain India'
  };
  
  return cultureMap[culture.toLowerCase()] || culture;
}

// Helper to get the best matching fallback response
function getFallbackResponse(query: string): { text: string, imageIndex: number } {
  const lowerQuery = query.toLowerCase();
  
  // Keywords with responses and corresponding image indexes
  const keywords = [
    {
      terms: ["tea ceremony", "japanese tea", "chanoyu"],
      response: "The Japanese tea ceremony, also called chanoyu or sado, is a traditional ritual influenced by Zen Buddhism in which powdered green tea (matcha) is ceremonially prepared and served to others. The ceremony emphasizes respect, harmony, purity, and tranquility.",
      imageIndex: 0
    },
    {
      terms: ["dragon", "chinese dragon", "dragon festival"],
      response: "Dragons hold significant cultural meaning across various civilizations. In Chinese culture, dragons symbolize power, strength, and good fortune. In European mythology, dragons are typically portrayed as fearsome creatures that hoard treasure.",
      imageIndex: 1
    },
    {
      terms: ["holi", "festival", "festivals", "celebration"],
      response: "Cultural festivals are important celebrations that mark significant events, seasons, or historical moments. They often include music, dance, special foods, and traditional clothing, helping communities maintain their cultural identity and pass traditions to new generations.",
      imageIndex: 2
    },
    {
      terms: ["india", "indian", "south asia", "colonial india", "british raj", "brahmin"],
      response: "Indian culture is one of the world's oldest and most diverse, dating back thousands of years. The Brahmin culture specifically refers to practices associated with the Brahmin caste, traditionally priests and scholars who preserved and interpreted sacred texts. They follow specific religious practices, dietary restrictions, and have traditionally been responsible for performing rituals and ceremonies. Throughout Indian history, Brahmins served as teachers, advisors to kings, and guardians of knowledge systems including Sanskrit literature, philosophy, mathematics, and astronomy.",
      imageIndex: 3
    },
    {
      terms: ["wedding", "marriage", "tradition", "ritual", "ceremony"],
      response: "Wedding traditions vary widely across cultures, reflecting unique cultural values and historical practices. Many cultures incorporate elements that symbolize prosperity, fertility, and family unity.",
      imageIndex: 2
    }
  ];
  
  // Find matching keyword
  for (const keyword of keywords) {
    if (keyword.terms.some(term => lowerQuery.includes(term))) {
      return { text: keyword.response, imageIndex: keyword.imageIndex };
    }
  }
  
  // Default response if no keywords match
  return { 
    text: "Cultural practices and traditions vary tremendously across the world, reflecting the unique history, environment, beliefs, and values of different societies. These traditions often include rituals, ceremonies, art forms, cuisine, clothing, music, dance, and storytelling that have been passed down through generations.",
    imageIndex: 2 
  };
}

export async function POST(request: Request) {
  try {
    const { query, history } = await request.json();
    console.log(`Processing cultural query: "${query}"`);
    
    // Initialize sources array
    let culturalSources: CulturalSource[] = [];
    
    // STEP 1: Search the web for relevant information
    console.log("Searching web for information...");
    const webResults = await searchWeb(query);
    const webContext = webResults.content;
    
    // Add any image sources from web results
    if (webResults.sources.length > 0) {
      culturalSources = [...webResults.sources];
      console.log(`Found ${webResults.sources.length} images from web search`);
    }
    
    // STEP 2: If we need more images, search specifically for images
    if (culturalSources.length < 2) {
      console.log("Searching for additional images...");
      const imageResults = await searchImages(query);
      
      // Add any new image sources
      if (imageResults.length > 0) {
        // Avoid duplicates by checking URLs
        const existingUrls = new Set(culturalSources.map(s => s.image));
        
        for (const img of imageResults) {
          if (!existingUrls.has(img.image)) {
            culturalSources.push(img);
            existingUrls.add(img.image);
            
            // Break if we have enough images
            if (culturalSources.length >= 3) break;
          }
        }
        
        console.log(`Added ${culturalSources.length} images from image search`);
      }
    }
    
    // STEP 3: Try to get images from ChromaDB if we still need more
    if (culturalSources.length < 2) {
      console.log("Trying ChromaDB for images...");
      const chromaImages = await getRelevantImagesFromChromaDB(query);
      
      // Add any new images from ChromaDB
      if (chromaImages.length > 0) {
        // Avoid duplicates
        const existingUrls = new Set(culturalSources.map(s => s.image));
        
        for (const img of chromaImages) {
          if (!existingUrls.has(img.image)) {
            culturalSources.push(img);
            existingUrls.add(img.image);
            
            // Break if we have enough images
            if (culturalSources.length >= 3) break;
          }
        }
        
        console.log(`Added images from ChromaDB, now have ${culturalSources.length} total`);
      }
    }
    
    // STEP 4: Use backup images if we still don't have any
    if (culturalSources.length === 0) {
      console.log("Using backup mock images as all retrievals failed");
      let selectedImageIndex = -1;
      
      // Get fallback response for image selection
      const fallback = getFallbackResponse(query);
      selectedImageIndex = fallback.imageIndex;
      
      // If we have a selected image from fallback content match
      if (selectedImageIndex >= 0 && selectedImageIndex < MOCK_IMAGES.length) {
        culturalSources = [MOCK_IMAGES[selectedImageIndex]];
      } else {
        // Try to match query keywords with appropriate images
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes("tea") || lowerQuery.includes("japan")) {
          culturalSources = [MOCK_IMAGES[0]];
        } else if (lowerQuery.includes("dragon") || lowerQuery.includes("chin")) {
          culturalSources = [MOCK_IMAGES[1]];
        } else if (lowerQuery.includes("india") || lowerQuery.includes("holi") || lowerQuery.includes("1800") || lowerQuery.includes("brahmin")) {
          culturalSources = [MOCK_IMAGES[3]]; // Use India-specific image for queries
        } else if (lowerQuery.includes("festival") || lowerQuery.includes("celebration")) {
          culturalSources = [MOCK_IMAGES[2]];
        } else {
          // Pick a random image if no specific match
          const randomIndex = Math.floor(Math.random() * MOCK_IMAGES.length);
          culturalSources = [MOCK_IMAGES[randomIndex]];
        }
      }
    }
    
    // STEP 5: Get response from OpenRouter LLM with web search context
    console.log("Getting LLM response with context...");
    let responseText = await getOpenRouterResponse(query, history, webContext);
    
    // If LLM call fails, use backup responses
    if (!responseText) {
      console.log('Using backup responses as LLM call failed');
      
      // Get fallback response text
      const fallback = getFallbackResponse(query);
      responseText = fallback.text;
    }
    
    // Convert any markdown in the response to HTML
    responseText = markdownToHtml(responseText);
    
    // Return the combined response
    return NextResponse.json({
      text: responseText,
      sources: culturalSources
    });
    
  } catch (error) {
    console.error('Error processing cultural agent request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 