import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Routes that should always be accessible (webhooks, API endpoints)
const isWebhookRoute = createRouteMatcher(['/api/webhooks(.*)'])

// Authentication pages
const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
])

// Marketing/public pages that logged-in users should NOT access
const isMarketingRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/product',
  '/features(.*)',
  '/industries(.*)',
  '/resources(.*)',
  '/contact',
  '/terms',
  '/privacy',
  '/about',
  '/request-demo',
  '/demo-credentials'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Always allow webhooks
  if (isWebhookRoute(req)) {
    return NextResponse.next()
  }

  // If user is authenticated
  if (userId) {
    // Redirect authenticated users away from marketing/auth pages to dashboard
    if (isMarketingRoute(req) || isAuthRoute(req)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    // Allow all authenticated routes
    return NextResponse.next()
  }

  // If user is not authenticated
  // Allow marketing and auth routes
  if (isMarketingRoute(req) || isAuthRoute(req)) {
    return NextResponse.next()
  }

  // Redirect to sign-in for all other routes (authenticated routes)
  return NextResponse.redirect(new URL('/sign-in', req.url))
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}