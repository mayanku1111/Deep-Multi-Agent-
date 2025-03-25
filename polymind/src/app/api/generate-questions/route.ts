import { generateText } from 'ai';
import { NextResponse } from "next/server";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';


const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });


const clarifyResearchGoals = async (topic: string) => {

    try{
        const { text } = await generateText({
            model: yourModel,
            prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
        
    }catch{

    }
}

export async function POST(req: Request) {

    const {topic} = await req.json();
    console.log("Topic:" ,topic);

    try{

    }catch{

    }

    return NextResponse.json({
        success:true
    },  {status:200});
}
