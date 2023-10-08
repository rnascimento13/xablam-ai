import { MobileSidebar } from "@/components/mobile-sidebar";
import { getApiLimitCount } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth-options'

import SignButton from "./sign-button";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  const apiLimitCount = await getApiLimitCount();
  const isPro = await checkSubscription();
  return ( 
    <div className="flex items-center p-4">
      <MobileSidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      <SignButton/>
    </div>
   );
}
 
export default Navbar;