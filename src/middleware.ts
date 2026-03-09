import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection via session cookie.
 * The cookie is set/cleared by FirebaseProvider on auth state changes.
 * NOTE: This cookie is not cryptographically verified — security relies on
 * Firestore security rules. For a production upgrade, replace with Firebase
 * Admin SDK session cookies (admin.auth().createSessionCookie).
 */
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/auth');

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
