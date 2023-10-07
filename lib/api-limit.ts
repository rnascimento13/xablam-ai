import prismadb from "@/lib/prismadb";
import { MAX_FREE_COUNTS } from "@/constants";
import { getServerSession } from "next-auth/next";
// import { authOptions } from "../app/api/auth/[...nextauth]";
// import { authOptions } from "../app/api/auth/[...nextauth]/route";
import { authOptions } from '@/lib/auth-options'

export const incrementApiLimit = async () => {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.name!
  // const { userId } = auth();
  // TODO: userId instead username
  if (!userId) {
    return;
  }

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
  const userId = session?.user?.name!
  // const { userId } = auth();
  // TODO: userId instead username

  if (!userId) {
    return false;
  }

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
  const userId = session?.user?.name!
  // const { userId } = auth();
  // TODO: userId instead username

  if (!userId) {
    return 0;
  }

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
