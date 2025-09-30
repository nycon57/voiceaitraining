import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { StyleGlideProvider } from '@/components/styleglide-provider'
import { ViewTransitions } from 'next-view-transitions'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SpeakStride - Sales Training Platform',
  description: 'AI-powered voice simulation training for sales teams',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
        <body className="relative flex min-h-screen flex-col antialiased font-sans" suppressHydrationWarning>
          <ClerkProvider
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {/* Background Blur */}
              <div className="bg-background/10 absolute inset-0 z-[-2] backdrop-blur-[85px] will-change-transform md:backdrop-blur-[170px]" />
              {/* Noise Background */}
              <div
                className="absolute inset-0 z-[-1] size-full opacity-70 mix-blend-overlay dark:md:opacity-100"
                style={{
                  background: `url(/images/noise.webp) lightgray 0% 0% / 83.69069695472717px 83.69069695472717px repeat`,
                }}
              />
              <StyleGlideProvider />
              <main className="flex-1">{children}</main>
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    console.log('View Transitions API supported:', 'startViewTransition' in document);
                    if ('startViewTransition' in document) {
                      console.log('🎉 Browser supports View Transitions!');
                    } else {
                      console.log('❌ Browser does not support View Transitions');
                    }
                  `,
                }}
              />
            </ThemeProvider>
          </ClerkProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}