import { getServerSession } from "next-auth/next";

import prismadb from "@/lib/prismadb";
import { MAX_FREE_COUNTS } from "@/constants";
import { authOptions } from '@/lib/auth-options'
import { mountUserId } from "@/lib/utils";

export const incrementApiLimit = async () => {
  const session = await getServerSession(authOptions)

  if (!session) return;
  
  const userId = mountUserId(session)

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId: userId },
  });

  if (userApiLimit) {
    await prismadb.userApiLimit.update({
      where: { userId: userId },
      data: { count: userApiLimit.count + 1 },
    });
  } else {
    await prismadb.userApiLimit.create({
      data: { userId: userId, count: 1 },
    });
  }
};

export const checkApiLimit = async () => {
  const session = await getServerSession(authOptions)

  if (!session) return false;
  
  const userId = mountUserId(session)

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: { userId: userId },
  });

  if (!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
    return true;
  } else {
    return false;
  }
};

export const getApiLimitCount = async () => {
  const session = await getServerSession(authOptions)

  if (!session) return 0;
  
  const userId = mountUserId(session)

  const userApiLimit = await prismadb.userApiLimit.findUnique({
    where: {
      userId
    }
  });
  if (!userApiLimit) {
    return 0;
  }

  return userApiLimit.count;
};
