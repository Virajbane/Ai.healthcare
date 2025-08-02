// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const sessionToken = request.cookies.get('sessionToken')?.value;
  
  const protectedPaths = ['/dashboard', '/Userpage']; // Unified dashboard
  const authPaths = ['/login', '/signup'];
  const publicPaths = ['/', '/api'];
  
  const pathname = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // If accessing protected path without session token, redirect to login
  if (isProtectedPath && !sessionToken) {
    console.log('No session token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (sessionToken) {
    try {
      const validationResponse = await fetch(new URL('/api/auth/validate-session', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken }),
      });

      if (validationResponse.ok) {
        const sessionData = await validationResponse.json();
        const userRole = sessionData.user.role;

        console.log('Session validated, user role:', userRole, 'pathname:', pathname);

        // Redirect authenticated users away from auth pages
        if (isAuthPath) {
          console.log('Authenticated user on auth page, redirecting to /dashboard');
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // You can add role-based protection here if needed
        // e.g. prevent doctor from accessing '/Userpage' if required

      } else {
        console.log('Session validation failed');
        if (isProtectedPath) {
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.set('sessionToken', '', {
            path: '/',
            expires: new Date(0),
          });
          return response;
        }
      }
    } catch (error) {
      console.error("Session validation error:", error?.message || error);

      if (isProtectedPath) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth/validate-session).*)',
  ],
};
