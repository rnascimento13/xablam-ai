import { NextResponse } from "next/server"
import { pusher } from "@/lib/pusher";

export async function POST(req: Request) {

  const data = await req.json()
  // console.log('image/webhook in: ', data)
  const imgId = data.id;
  const status = data.status;
  const res = { imgId, status }
  // console.log('image/webhook out: ', res)
    // Pusher notification
  const response = await pusher.trigger("chat", imgId, res);
    return NextResponse.json( "Ok", { status: 200 });
};
