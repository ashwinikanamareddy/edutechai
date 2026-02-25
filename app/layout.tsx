import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth/auth-provider'
import { GlobalChatProvider } from '@/components/chat/chat-context'
import { FloatingChatButton } from '@/components/chat/floating-chat-button'
import { ChatPanel } from '@/components/chat/chat-panel'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: 'Vidya Saathi - Detect Silent Confusion Before Students Fail',
  description: 'An AI-powered educational intelligence platform designed for rural school students (Grade 1-12), combining adaptive learning, confusion detection, engagement monitoring, teacher analytics, and parent alerts.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b72cc',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <AuthProvider>
          <GlobalChatProvider>
            {children}
            <FloatingChatButton />
            <ChatPanel />
          </GlobalChatProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
