// app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from '@/components/Navbar'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { SettingsProvider } from '@/contexts/SettingsContext'
//import { Providers } from './providers'
import { DataProvider } from '@/contexts/DataContext'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Hierarchical Minion Management',
  description: 'A flexible and powerful minion management system',
  keywords: 'minion, task management, productivity, organization',
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <DataProvider>
            <Navbar />
            <KeyboardShortcuts />
            {children}
            <Toaster />
          </DataProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}