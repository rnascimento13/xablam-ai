import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from '@/lib/auth-options'

export async function POST(
  req: Request
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { imgId } = body;

    if (!imgId) {
      return new NextResponse("the operation id is required", { status: 400 });
    }

    const apiUrl = `https://api.runpod.ai/v2/${process.env.RUNPOD_API_ID}/status/${imgId}`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
    })

    const data = await response.json()

    if (!data || !data?.delayTime || !data?.output?.images) {
      return new NextResponse("The operation returned with a error", { status: 400 });
    }

    const delay = data.delayTime;
    const id = data.id;
    const imgsData = await data.output.images;
    const images = imgsData.map((e: string) => `data:image/gif;base64,${e}`)
    const res = {
      delay,
      id,
      images,
    }

    return NextResponse.json(res);
  } catch (error) {
    console.log('[IMAGE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
