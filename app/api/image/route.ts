import { NextResponse } from "next/server";
// import { Configuration, OpenAIApi } from "openai";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { json } from "stream/consumers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
// import { authOptions } from "../auth/[...nextauth]/route";





// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

export async function POST(
  req: Request
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.name!
    // const { userId } = auth();
    // TODO: userId instead username
  
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // if (!configuration.apiKey) {
    //   return new NextResponse("OpenAI API Key not configured.", { status: 500 });
    // }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    if (!resolution) {
      return new NextResponse("Resolution is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    const apiUrl = `https://api.runpod.ai/v2/${process.env.RUNPOD_API_ID}/runsync`
    // const apiUrl = `http://localhost:3000/api/mock`

    console.log(apiUrl)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        // User-Agent: Thunder Client (https://www.thunderclient.com)
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify({
        input: {
          api_name: 'txt2img',
          prompt: 'blonde girl ponytail on a beach boardwalk cafe sitting at the table sandwich wearing a tanktop and shorts sneakers stuffed animals tropical beach beautiful cloudy sky bright sunny day, (Clutter-Home:0.8), (masterpiece:1.2) (photorealistic:1.2) (bokeh) (best quality) (detailed skin:1.3) (intricate details) (8k) (detailed eyes) (sharp focus)',
          restore_faces: true,
          negative_prompt: '(AS-Young-Neg:1.3), (monochrome) (bad hands) (disfigured) (grain) (Deformed) (poorly drawn) (mutilated) (lowres) (deformed) (dark) (lowpoly) (CG) (3d) (blurry) (duplicate) (watermark) (label) (signature) (frames) (text), nsfw, nudity',
          seed: 3302206224,
          override_settings: { sd_model_checkpoint: '' },
          cfg_scale: 5,
          sampler_index: 'DDIM',
          num_inference_steps: 20,
          email: 'test@example.com'
        }
      }),
    })

    const data = await response.json()
    console.log(data)
    
    return NextResponse.json(data);
    // const response = await openai.createImage({
    //   prompt,
    //   n: parseInt(amount, 10),
    //   size: resolution,
    // });

    // if (!isPro) {
    //   await incrementApiLimit();
    // }

    // return NextResponse.json(response.data.data);
    // return NextResponse.json({ role: 'assistant', content: 'Hello! How can I assist you today?' });
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
