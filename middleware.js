// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const sessionToken = request.cookies.get('sessionToken')?.value;
  
  const protectedPaths = ['/UserDashboard', '/DoctorDashboard', '/Userpage'];
  const authPaths = ['/login', '/signup'];
  const publicPaths = ['/', '/api'];
  
  const pathname = request.nextUrl.pathname;
  
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );
  
  const isAuthPath = authPaths.some(path => 
    pathname.startsWith(path)
  );
  
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path)
  );

  // If accessing protected path without session token, redirect to login
  if (isProtectedPath && !sessionToken) {
    console.log('No session token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If session token exists, validate it with database
  if (sessionToken) {
    try {
      // Call our session validation API
      const validationResponse = await fetch(new URL('/api/auth/validate-session', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken })
      });

      if (validationResponse.ok) {
        const sessionData = await validationResponse.json();
        const userRole = sessionData.user.role;
        
        console.log('Session validated, user role:', userRole, 'pathname:', pathname);

        // If authenticated user visits auth pages, redirect to their dashboard
        if (isAuthPath) {
          if (userRole === 'doctor') {
            console.log('Authenticated doctor on auth page, redirecting to doctor dashboard');
            return NextResponse.redirect(new URL('/DoctorDashboard', request.url));
          } else {
            console.log('Authenticated patient on auth page, redirecting to user dashboard');
            return NextResponse.redirect(new URL('/UserDashboard', request.url));
          }
        }

        // Role-based redirect logic for protected paths
        if (isProtectedPath) {
          if (userRole === 'patient') {
            // Patient trying to access doctor dashboard
            if (pathname.startsWith('/DoctorDashboard')) {
              console.log('Patient accessing doctor dashboard, redirecting to user dashboard');
              return NextResponse.redirect(new URL('/UserDashboard', request.url));
            }
          } 
          else if (userRole === 'doctor') {
            // Doctor trying to access patient dashboard
            if (pathname.startsWith('/UserDashboard') || pathname.startsWith('/Userpage')) {
              console.log('Doctor accessing patient dashboard, redirecting to doctor dashboard');
              return NextResponse.redirect(new URL('/DoctorDashboard', request.url));
            }
          }
        }
        
      } else {
        console.log('Session validation failed');
        // Invalid session, redirect to login if accessing protected path
        if (isProtectedPath) {
          // Clear invalid session cookie
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.set('sessionToken', '', { 
            path: '/', 
            expires: new Date(0) 
          });
          return response;
        }
      }
      
    } catch (error) {
      console.log('Session validation error:', error);
      // Error validating session, redirect to login if accessing protected path
      if (isProtectedPath) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  // Allow access to all other paths
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth/validate-session).*)',
  ],
};