"use client";

import { MobileSidebar } from "@/components/mobile-sidebar";
import SignButton from "@/components/sign-button";

export const Navbar = ({
  apiLimitCount = 0,
  isPro = false
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  return ( 
    <div className="flex items-center p-4">
      <MobileSidebar isPro={isPro} apiLimitCount={apiLimitCount} />
      <SignButton/>
    </div>
   );
}
 
export default Navbar;