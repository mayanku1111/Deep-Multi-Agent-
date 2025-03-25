import next from "next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    const {topic} = await req.json();
    console.log("Topic:" ,topic);

    return NextResponse.json({
        success:true
    },  {status:200});
}
