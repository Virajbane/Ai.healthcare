import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (routes that don't require authentication)
const isPublicRoute = createRouteMatcher([
  '/',
  '/Auth/sign-in(.*)',
  '/Auth/sign-up(.*)',
]);

// Define protected routes (routes that require authentication)
const isProtectedRoute = createRouteMatcher([
  '/Userpage(.*)',  // Userpage and any sub-routes
]);

// Clerk middleware function
const middleware = async (auth, request) => {
  const user = auth.user; // Access the user object

  // If the route is not public and the user is not authenticated, protect the route
  if (!isPublicRoute(request) && !user) {
    await auth.protect();  // Prevent unauthenticated users from accessing protected routes
  }

  // Optional: Additional logic for handling specific routes or actions
  if (isProtectedRoute(request) && !user) {
    await auth.protect();  // If the route is protected and the user is unauthenticated, protect it
  }
};

// Export the Clerk middleware
export default clerkMiddleware(middleware);

// Export the matcher configuration to define which routes this middleware applies to
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',  // Exclude Next.js internals and static files
    '/(api|trpc)(.*)',  // Always run for API routes
    '/Userpage(.*)',  // Protect routes under /Userpage
  ],
};
