import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { mountUserId } from "@/lib/utils"
import { authOptions } from "@/lib/auth-options"
import { pusher } from "@/lib/pusher";

export async function POST(req: Request) {

  const data = await req.json()

  // const delay = data.delayTime;
  const imgId = data.id;
  // const imgsData = await data.output.images;
  // const images = imgsData.map((e: string) => `data:image/gif;base64,${e}`)
  const res = { imgId }
  console.log('webhook ok: ', res)
    // Pusher notification
    const response = await pusher.trigger("chat", "chat-event", res);
    // console.log('webhook ok: ', response)
    

    // console.log('runpod webhook POST body: ',body)
    // return NextResponse.json({ message: "This Worked", success: true });
    return NextResponse.json( "Ok", { status: 200 });
};
