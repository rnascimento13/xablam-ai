"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image"
import Link from "next/link"
import { useSession, signIn } from "next-auth/react"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const font = Montserrat({ weight: '600', subsets: ['latin'] });

export const LandingNavbar = () => {
  const { data: session } = useSession()
  const dashboardUrl = '/dashboard'
  
  return (
    <nav className="p-4 bg-transparent flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <div className="relative h-8 w-8 mr-4">
          <Image fill alt="Logo" src="/logo.png" />
        </div>
        <h1 className={cn("text-2xl font-bold text-white", font.className)}>
          Genius
        </h1>
      </Link>
      {!!session ? (
        <div className="flex items-center gap-x-2">
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full">
              Dashboard
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-x-2">
          <br />
          <button onClick={() => signIn(undefined, { callbackUrl:dashboardUrl })} className="rounded-full">
            Get Started
          </button>
        </div>
      )}
    </nav>
  )
}