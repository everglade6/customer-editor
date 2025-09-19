import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(pathname);

  // Get token from cookies
  const token = request.cookies.get('token');

  // If accessing root path without token, redirect to login
  if (pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing protected path without token, redirect to login
  if (!isPublicPath && !token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing login page with valid token, redirect to main page
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

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
