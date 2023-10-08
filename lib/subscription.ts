import { getServerSession } from "next-auth/next"

import { authOptions } from '@/lib/auth-options'
import prismadb from "@/lib/prismadb";
import { mountUserId } from "@/lib/utils";

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async () => {
  const session = await getServerSession(authOptions)

  if (!session) return false;
  
  const userId = mountUserId(session)

  const userSubscription = await prismadb.userSubscription.findUnique({
    where: {
      userId: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  })

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now()

  return !!isValid;
};
