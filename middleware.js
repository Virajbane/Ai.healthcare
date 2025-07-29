import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get token from localStorage (client-side) or cookies
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Protected routes - only protect specific dashboard routes
  const protectedPaths = ['/UserDashboard', '/Doctor', '/Userpage'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Public routes that should always be accessible
  const publicPaths = ['/', '/login', '/signup', '/api'];
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing protected route without token, redirect to login
  if (isProtectedPath && !token) {
    console.log('Redirecting to login - no token found for protected path:', request.nextUrl.pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing protected route with token, allow access
  if (isProtectedPath && token) {
    console.log('Allowing access to protected path:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // For public routes, always allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Default: allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};