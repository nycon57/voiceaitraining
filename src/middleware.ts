import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/request-demo',
  '/demo-credentials',
  '/api/webhooks(.*)',
  '/pricing',
  '/product',
  '/features(.*)',
  '/industries(.*)',
  '/resources(.*)',
  '/contact',
  '/terms',
  '/privacy',
  '/admin(.*)',
  '/about'
])

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // If user is authenticated but on auth pages, redirect to app
  if (isAuthRoute(req) && userId) {
    if (orgId) {
      return NextResponse.redirect(new URL(`/org/${orgId}/dashboard`, req.url))
    } else {
      return NextResponse.redirect(new URL('/select-org', req.url))
    }
  }

  // If authenticated user visits root, redirect to dashboard
  if (req.nextUrl.pathname === '/' && userId) {
    if (orgId) {
      return NextResponse.redirect(new URL(`/org/${orgId}/dashboard`, req.url))
    } else {
      return NextResponse.redirect(new URL('/select-org', req.url))
    }
  }

  // Handle org-scoped routes
  if (req.nextUrl.pathname.startsWith('/org/')) {
    const pathOrgId = req.nextUrl.pathname.split('/')[2]

    // If no org in session but org route accessed, redirect to org selection
    if (!orgId) {
      return NextResponse.redirect(new URL('/select-org', req.url))
    }

    // If accessing different org than current session, switch org context
    if (pathOrgId && pathOrgId !== orgId) {
      const response = NextResponse.next()
      response.cookies.set('clerk-org-hint', pathOrgId)
      return response
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}