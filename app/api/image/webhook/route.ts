import { NextResponse } from "next/server"
import { pusher } from "@/lib/pusher";

export async function POST(req: Request) {

  const data = await req.json()
  // console.log('image/webhook in: ', data)

  if (!(data.status) || !(data.id)) {
    return new NextResponse("Unknow response", { status: 400 });
  }

  const id = data.id;
  const status = data.status;
  const res = { id, status }
  // console.log('image/webhook out: ', res)

  // Pusher notification
  const response = await pusher.trigger("chat", id, res);
    return NextResponse.json( "Ok", { status: 200 });
};
