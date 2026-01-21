import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import ShareButton from '@/components/layout/ShareButton'
import Tutorial from '@/components/layout/Tutorial'; 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InkOra - Personalize Invitations at Scale',
  description: 'InkOra helps you personalize invitations beautifully, at scale.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen pb-20">  {/* Added pb-20 for button space */}
          {children}
        </main>
        <ShareButton />
        <Tutorial />  {/* Add this */}
      </body>
    </html>
  )
}