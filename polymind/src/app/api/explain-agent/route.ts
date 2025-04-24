import { NextResponse } from 'next/server';

// Define types for the messages
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// List of valid OpenRouter model IDs
const VALID_OPENROUTER_MODELS = [
  "anthropic/claude-3-opus",
  "anthropic/claude-3-sonnet",
  "anthropic/claude-3-haiku",
  "google/gemini-pro",
  "google/gemini-1.5-pro-latest",
  "meta-llama/llama-3-70b-instruct",
  "meta-llama/llama-3-8b-instruct",
  "mistralai/mistral-large",
  "mistralai/mistral-7b-instruct",
  "openai/gpt-4",
  "openai/gpt-3.5-turbo"
];

// Function to convert markdown to HTML
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

// OpenRouter API integration for LLM responses
async function getOpenRouterResponse(query: string, messages: Message[], context: string = ""): Promise<string | null> {
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
      promptContent = `Query: ${query}\n\nHere's some relevant information from the web:\n${context}\n\nExplain this in simple terms as if speaking to a 5-year-old. Use simple analogies, examples, and short sentences.`;
    } else {
      promptContent = `${query}\n\nExplain this in simple terms as if speaking to a 5-year-old. Use simple analogies, examples, and short sentences.`;
    }
    
    // Add the new user query
    formattedMessages.push({
      role: 'user',
      content: promptContent
    });
    
    // Enhanced instructions for better formatting and simple explanations
    formattedMessages.unshift({
      role: 'system',
      content: `You are the "Explain Like I'm 5" assistant who specializes in making complex topics simple.
      When explaining concepts:
      1. Use very simple language a 5-year-old could understand
      2. Avoid jargon and technical terms
      3. Use relatable examples and analogies
      4. Include colorful explanations that engage the imagination
      5. Break concepts down into small, digestible pieces
      6. Use simple HTML formatting with <p> tags for paragraphs and <ul>/<li> for lists
      7. Format any examples in a way that stands out
      
      Remember: Your goal is to make the complex simple, not to be comprehensive. Focus on core concepts.`
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
        'X-Title': 'PolyMind ELI5 Agent'
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
async function searchWeb(query: string): Promise<string> {
  try {
    if (!process.env.EXA_API_KEY) {
      console.warn("Exa API key missing");
      return "";
    }
    
    const searchQuery = `${query} explanation tutorial`;
    
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
        includeDomains: ["wikipedia.org", "khanacademy.org", "howstuffworks.com", "simpleexplained.com", "britannica.com", "science.org", "nationalgeographic.com"]
      })
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Exa search error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    // Extract content from search results
    let combinedContent = "";
    
    if (searchData && searchData.results && searchData.results.length > 0) {
      // Build content from search results
      searchData.results.forEach((result: any, idx: number) => {
        // Only include the first 3 results in the context to avoid too much text
        if (idx < 3 && result.text) {
          combinedContent += `[Source: ${result.title}]\n${result.text}\n\n`;
        }
      });
    }
    
    return combinedContent;
  } catch (error) {
    console.error('Error searching the web:', error);
    return "";
  }
}

// Default responses for fallback scenarios
const FALLBACK_RESPONSES = [
  "Imagine your favorite toy. Now imagine that toy can do amazing things, but you don't know how it works inside. That's a bit like what you're asking about! Sometimes big people study many years to understand these things, but I can try to make it simple for you.",
  "Think about when you're learning to ride a bike. At first, it seems really hard and scary! But then you practice, and soon it becomes easy. The topic you're asking about is a bit like that - it seems tricky at first, but once we break it down into smaller parts, it gets much easier to understand!",
  "You know how sometimes your tummy growls when you're hungry? That's your body sending you a message that it needs food. Well, the world is full of things that send messages to each other too! Let me explain this in a way that's fun and easy to understand.",
  "Picture your favorite storybook. It has a beginning, middle, and end that all make sense together. The topic you're asking about also has different parts that fit together to tell a complete story. Let me tell you that story in a way that's super simple!"
];

// Handler for POST requests
export async function POST(request: Request) {
  try {
    const { query, history } = await request.json();
    console.log(`Processing ELI5 query: "${query}"`);
    
    // STEP 1: Search the web for relevant information
    console.log("Searching web for information...");
    const webContext = await searchWeb(query);
    
    // STEP 2: Get response from OpenRouter LLM with web search context
    console.log("Getting LLM response with context...");
    let responseText = await getOpenRouterResponse(query, history, webContext);
    
    // If LLM call fails, use backup responses
    if (!responseText) {
      console.log('Using backup responses as LLM call failed');
      
      // Get random fallback response
      const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
      responseText = FALLBACK_RESPONSES[randomIndex] + "\n\nI'm still learning about this topic, but I'll try my best to explain it in a way that makes sense!";
    }
    
    // Convert any markdown to HTML
    responseText = markdownToHtml(responseText);
    
    // Return the response
    return NextResponse.json({
      text: responseText
    });
    
  } catch (error) {
    console.error('Error processing ELI5 agent request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 