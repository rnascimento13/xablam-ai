import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { authOptions } from '@/lib/auth-options'
import { mountUserId } from "@/lib/utils";

export async function POST(
  req: Request
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = mountUserId(session)
    const body = await req.json();
    const { prompt, amount, resolution } = body;
    const resolutionHW = resolution.split('x')

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

    const apiUrl = `https://api.runpod.ai/v2/${process.env.RUNPOD_API_ID}/run`

    console.log(apiUrl)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify({
        webhook: "https://xablam-ai.loca.lt/api/image/webhook",
        input: {
          api_name: 'txt2img',
          prompt: prompt || 'blonde girl ponytail on a beach boardwalk cafe sitting at the table sandwich wearing a tanktop and shorts sneakers stuffed animals tropical beach beautiful cloudy sky bright sunny day, (Clutter-Home:0.8), (masterpiece:1.2) (photorealistic:1.2) (bokeh) (best quality) (detailed skin:1.3) (intricate details) (8k) (detailed eyes) (sharp focus)',
          restore_faces: true,
          negative_prompt: '(AS-Young-Neg:1.3), (monochrome) (bad hands) (disfigured) (grain) (Deformed) (poorly drawn) (mutilated) (lowres) (deformed) (dark) (lowpoly) (CG) (3d) (blurry) (duplicate) (watermark) (label) (signature) (frames) (text), nsfw, nudity',
          seed: 3302206224,
          override_settings: { sd_model_checkpoint: '' },
          cfg_scale: 5,
          sampler_index: 'DDIM',
          num_inference_steps: 20,
          width: resolutionHW[0],
          height: resolutionHW[1],
          batch_size: amount,
          email: userId
        }
      }),
    })

    const data = await response.json()

    const imgId = data.id;
    const status = data.status;
    if (!(status == 'IN_QUEUE') ) {
      return new NextResponse("Some error receiving the request.", { status: 400 });
    }
    // if (!isPro) {
    //   await incrementApiLimit();
    // }
    console.log('imagId: ', imgId)
    return NextResponse.json({ status, imgId });
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
