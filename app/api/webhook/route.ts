import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { mountUserId } from "@/lib/utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    
    const authSession = await getServerSession(authOptions)

    if (!authSession || !authSession?.user) {
      return new NextResponse("Login required", { status: 400 });
    }

    if (!authSession?.user?.image || !authSession?.user?.email) {
      return new NextResponse("Provider error", { status: 400 });
    }
    
    const userId = mountUserId(authSession)
  
    await prismadb.userSubscription.create({
      data: {
        userId: userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    })
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    })
  }

  return new NextResponse(null, { status: 200 })
};
