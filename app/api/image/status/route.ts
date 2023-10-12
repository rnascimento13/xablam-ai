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
    // console.log('image/status in: ',body)

    if (!body.id) {
      return new NextResponse("Unknow body", { status: 400 });
    }
  
    const { id } = body;

    if (!id) {
      return new NextResponse("the operation id is required", { status: 400 });
    }

    const apiUrl = `https://api.runpod.ai/v2/${process.env.RUNPOD_API_ID}/status/${id}`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
    })

    const data = await response.json()
    // console.log('image/status response: ', data.status)

    if (!(data.status) || !(data.id)) {
      return new NextResponse("Unknow response", { status: 400 });
    }

    const status = data.status;

    if ((status == 'IN_QUEUE') || (status == 'IN_PROGRESS')) {
      return NextResponse.json( { status, id });
    }

    if (!data || !data?.delayTime || !data?.output?.images) {
      return new NextResponse("The operation returned with a error", { status: 400 });
    }

    if ((status == 'COMPLETED')) {
      const delay = data.delayTime;
      const imgsData = data.output.images;
      const images = imgsData.map((e: string) => `data:image/gif;base64,${e}`)
      const res = {
        id,
        status,
        delay,
        images,
      }
      return NextResponse.json(res);
    }
    
    return new NextResponse("The operation returned with a error", { status: 400 });



  } catch (error) {
    console.log('[IMAGE_STATUS_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
