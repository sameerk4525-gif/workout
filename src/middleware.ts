import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Standard environment checker
const isMockAuth = () => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  return (
    !publishableKey ||
    !secretKey ||
    publishableKey.includes('mock') ||
    secretKey.includes('mock')
  );
};

export default function middleware(request: NextRequest) {
  // If running in local mock development mode, bypass Clerk route blocking
  if (isMockAuth()) {
    // If user lands on root "/", redirect to "/dashboard" for instant entry
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Real Clerk protection
  try {
    const { clerkMiddleware, createRouteMatcher } = require('@clerk/nextjs/server');
    const isPublicRoute = createRouteMatcher([
      '/sign-in(.*)',
      '/sign-up(.*)',
      '/api/webhooks/clerk(.*)',
      '/onboarding(.*)',
    ]);

    const middlewareRunner = clerkMiddleware((auth: any, req: any) => {
      if (!isPublicRoute(req)) {
        auth().protect();
      }
    });

    return middlewareRunner(request);
  } catch (error) {
    // Fallback if Clerk modules are not loaded properly
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Protect all app routing paths except internal statics, icons, and API webhooks
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
