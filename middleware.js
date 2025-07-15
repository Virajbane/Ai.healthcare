import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/Api/Auth/sign-in",
  "/Api/Auth/sign-up"
];

// Middleware function
export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;

  // Redirect to login if not authenticated and route is protected
  if (!publicRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
