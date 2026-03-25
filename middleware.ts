import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // We explicitly make the login page and homepage accessible to everyone
  const isPublicRoute = nextUrl.pathname.startsWith('/login') || nextUrl.pathname === '/';

  // If a user is not logged in, and tries to visit a private route like /dashboard, kick them to /login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // If a logged-in user visits the login page, automatically forward them to their dashboard
  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  return NextResponse.next();
});

// The matcher tells Next.js which paths this middleware should run on.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
