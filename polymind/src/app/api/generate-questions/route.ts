import { NextResponse } from "next/server";
import { generateObject } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from "zod";


const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || "",
  });

const clarifyResearchGoals = async (topic: string) => {

    const prompt = `
You are an expert research assistant helping to refine a research topic. 

RESEARCH TOPIC: <topic>${topic}</topic>

TASK: Generate 2-3 essential clarifying questions clarifying questions to help narrow down the research scope. 

Each question should:
- Be open-ended rather than yes/no
- Target a specific aspect that needs clarification
- Help the researcher make concrete decisions about their approach

Focus on questions that address:
1. SCOPE & BOUNDARIES: Which specific aspects, time periods, geographical areas, or sub-topics should be included or excluded?
2. PERSPECTIVE & APPROACH: Which methodological approaches, theoretical frameworks, or viewpoints should be prioritized?
3. INTENDED OUTCOME: What's the ultimate purpose of this research? A recommendation, historical analysis, comparison, etc.?
4. PRACTICAL APPLICATION: How will this research be applied, implemented, or utilized in real-world contexts?

FORMAT YOUR RESPONSE AS:
1. [First clarifying question]
2. [Second clarifying question]
3. [Third clarifying question]
(etc.)

Be thoughtful and specific - these questions will guide the entire research process.
`


    try{
        const { object } = await generateObject({
            model: openrouter("meta-llama/llama-3.3-70b-instruct"),
            prompt,
            schema: z.object({
                questions: z.array(z.string())
            })
          });

          return object.questions;
    }catch(error){
    console.log("Error while generating questions: ", error)

    }
}


export async function POST(req: Request){

    const {topic} = await req.json();
    console.log("Topic: ", topic);

    try{
           const questions = await clarifyResearchGoals(topic);
           console.log("Questions: ", questions)

           return NextResponse.json(questions)
    }catch(error){

       console.error("Error while generating questions: ", error)
        return NextResponse.json({
            success: false, error: "Failed to generate questions"
        }, {status: 500})

    }


   
}