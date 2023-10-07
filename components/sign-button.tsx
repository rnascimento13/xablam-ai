'use client'

import { signIn, signOut, useSession } from "next-auth/react";

const SignButton = () => {
  const { data: session } = useSession();
  const dashboardUrl = '/dashboard/'
  const landingUrl = '/'
 
  if (session) {
    return (
      <div className="flex w-full justify-end">
        <br />
        <button onClick={() => signOut({ callbackUrl:landingUrl })}>Sign out</button>
      </div>
    );
  }
  return (
    <div className="flex w-full justify-end">
      Not signed in <br />
      <button onClick={() => signIn(undefined, { callbackUrl:dashboardUrl })}>Sign in</button>
    </div>
  );
}
 
export default SignButton
