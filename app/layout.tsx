import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ToasterProvider } from '@/components/toaster-provider'
import { ModalProvider } from '@/components/modal-provider'
import { CrispProvider } from '@/components/crisp-provider'

import { getServerSession } from "next-auth";
import SessionProvider from "../components/session-provider";
import './globals.css'

const font = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Genius',
  description: 'AI Platform',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <CrispProvider />
      <body className={font.className}>
        <SessionProvider session={session}>
          <ToasterProvider />
          <ModalProvider />
          {children}
        </SessionProvider>  
      </body>
    </html>
  )
}
