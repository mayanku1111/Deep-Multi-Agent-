import { NextResponse } from 'next/server';
import { Message, CulturalSource } from '@/types/cultural';

// Mock data for demonstration
const MOCK_IMAGES = [
  {
    title: "Traditional Japanese Tea Ceremony",
    description: "A traditional Japanese tea ceremony (chanoyu) being performed",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "sample",
  },
  {
    title: "Chinese Dragon Festival",
    description: "Dragon dance performed during Chinese New Year celebrations",
    image: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "sample",
  },
  {
    title: "Indian Holi Festival",
    description: "Celebration of the Holi festival with colorful powders",
    image: "https://images.unsplash.com/photo-1576089073624-b065946a2b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    origin: "sample",
  },
];

// Cultural topics and sample responses for demonstration
const CULTURAL_TOPICS = {
  "tea ceremony": "The Japanese tea ceremony, also called chanoyu or sado, is a traditional ritual influenced by Zen Buddhism in which powdered green tea (matcha) is ceremonially prepared and served to others. The ceremony emphasizes respect, harmony, purity, and tranquility through precise movements and careful attention to detail. Dating back to the 9th century, it was popularized by Sen no Rikyu in the 16th century. The ritual takes place in a specially designed tea room with traditional tatami mats and minimal decoration, reflecting the wabi-sabi aesthetic of finding beauty in imperfection and impermanence.",
  
  "dragon": "Dragons hold significant cultural meaning across various civilizations. In Chinese culture, dragons symbolize power, strength, and good fortune, and are believed to bring rain for crops. Unlike Western dragons, Chinese dragons are benevolent and wise. In European mythology, dragons are typically portrayed as fearsome, fire-breathing creatures that hoard treasure and need to be slain by heroes. Norse mythology features the world serpent Jörmungandr, while Mesoamerican cultures revered the feathered serpent deity Quetzalcoatl. The dragon symbol appears in festivals, art, literature, and national symbols across many cultures, each with their unique interpretation of this mythical creature.",
  
  "wedding": "Wedding traditions vary widely across cultures. In Hindu ceremonies, the couple circles a sacred fire in the Saptapadi ritual, making seven promises to each other. Chinese weddings often include the Tea Ceremony, where the couple serves tea to their elders as a sign of respect. Western white wedding dresses became popular after Queen Victoria, while red is considered lucky in Chinese and Indian weddings. Japanese Shinto weddings include the san-san-kudo ritual of sharing sake, and Jewish traditions culminate with breaking a glass. Many cultures incorporate elements that symbolize prosperity, fertility, and family unity, though specific customs reflect unique cultural values and historical practices.",
  
  "food": "Food traditions are central to cultural identity worldwide. In Japan, the careful preparation and presentation of seasonal ingredients showcases harmony with nature. Mediterranean cultures emphasize communal dining with shared plates and olive oil as a culinary cornerstone. Indian cuisine uses distinctive spice blends (masalas) that vary by region, with religious practices influencing vegetarianism. Chinese culinary philosophy balances yin and yang through contrasting flavors and textures. Many cultures have fermentation traditions, from Korean kimchi to German sauerkraut, originally developed for preservation but now valued for unique flavors and potential health benefits.",
  
  "default": "Cultural practices and traditions vary tremendously across the world, reflecting the unique history, environment, beliefs, and values of different societies. These traditions often include rituals, ceremonies, art forms, cuisine, clothing, music, dance, and storytelling that have been passed down through generations. While cultural practices differ widely, they typically serve similar functions: strengthening community bonds, marking important life transitions, expressing collective identity, and connecting people to their ancestors and heritage. Understanding diverse cultural perspectives enriches our appreciation of human creativity and our shared humanity despite our differences."
};

export async function POST(request: Request) {
  try {
    const { query, history } = await request.json();
    
    // Simple keyword matching for demonstration
    let responseText = CULTURAL_TOPICS.default;
    let selectedImages: CulturalSource[] = [];
    
    // Check for keywords in the query
    for (const [keyword, response] of Object.entries(CULTURAL_TOPICS)) {
      if (query.toLowerCase().includes(keyword)) {
        responseText = response;
        
        // Add relevant images based on the keyword
        if (keyword === "tea ceremony") {
          selectedImages.push(MOCK_IMAGES[0]);
        } else if (keyword === "dragon") {
          selectedImages.push(MOCK_IMAGES[1]);
        } else if (keyword.includes("festival") || keyword.includes("holi")) {
          selectedImages.push(MOCK_IMAGES[2]);
        }
        
        break;
      }
    }
    
    // If no specific images selected, add a random one
    if (selectedImages.length === 0 && MOCK_IMAGES.length > 0) {
      const randomIndex = Math.floor(Math.random() * MOCK_IMAGES.length);
      selectedImages.push(MOCK_IMAGES[randomIndex]);
    }
    
    // Return the response
    return NextResponse.json({
      text: responseText,
      sources: selectedImages
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 