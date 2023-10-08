import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Session } from "next-auth"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}

// return a unique userId with the providerName and the email eg. 'google-my@email.com'
export function mountUserId(session: Session) {
  const uri = session?.user?.image!
  const parts = uri.split(".");
  const providerName = parts[1].replace('usercontent', '');
  return `${providerName}-${session?.user?.email!}`
}


