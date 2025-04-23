import { NextResponse } from "next/server";
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from "zod";


const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || "",
  });

const clarifyResearchGoals = async (topic: string) => {

    const prompt = `
    Given the research topic <topic>${topic}</topic>, generate 3 clarifying questions to help narrow down the research scope. Focus on identifying:
    - Specific aspects of interest
    - Required depth/complexity level
    - Any particular perspective or excluded sources
    `

    try{
        const { object } = await generateObject({
            model: openrouter("openai/gpt-4o-mini"),
            prompt,
            schema: z.object({
                questions: z.array(z.string())
            })
          });

          return object.questions;
    }catch(error){
    console.log("Error while generating questions: ", error)
    return ["What specific aspects of this topic interest you?", 
            "What level of detail do you need?", 
            "Are there any specific sources you'd like to focus on?"];
    }
}


export async function POST(req: Request){

    const {topic} = await req.json();
    console.log("Topic: ", topic);

    try{
           const questions = await clarifyResearchGoals(topic);
           console.log("Questions: ", questions)

           if (!questions) {
             return NextResponse.json({
               success: false, 
               error: "Failed to generate questions"
             }, {status: 500});
           }

           return NextResponse.json(questions)
    }catch(error){

       console.error("Error while generating questions: ", error)
        return NextResponse.json({
            success: false, error: "Failed to generate questions"
        }, {status: 500})

    }
}