import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { checkSubscription } from "@/lib/subscription";
import { getApiLimitCount } from "@/lib/api-limit";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();

  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }


  return ( 
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      </div>
      <main className="md:pl-72 pb-10">
        <Navbar isPro={isPro} apiLimitCount={apiLimitCount} />
        {children}
      </main>
    </div>
   );
}
 
export default DashboardLayout;
