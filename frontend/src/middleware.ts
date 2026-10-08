import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/recover-account', '/'];

type StoredUser = { role?: string };

function readUserCookie(raw: string | undefined): StoredUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

// Public static assets (manifest, favicons, images, ...) must never be
// redirected to /login — otherwise browsers receive HTML instead of JSON
// and report "Manifest: Line: 1, column: 1, Syntax error".
const STATIC_ASSET = /^\/(?:_next\/|manifest\.json$|favicon\.(?:ico|svg)$|robots\.txt$|sitemap\.xml$|.*\.(?:svg|png|jpe?g|gif|ico|webp|webmanifest|txt|map)$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_ASSET.test(pathname)) {
    return NextResponse.next();
  }
  // Read token from cookie (works in Edge runtime middleware)
  const token = request.cookies.get('rms_token')?.value;
  const user = readUserCookie(request.cookies.get('rms_user')?.value);

  // Allow public paths. Auth pages stay reachable even with an active
  // session so users can switch accounts (e.g. admin → tenant) without
  // being bounced back to their portal.
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // Protect all other paths
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const userRole = user?.role || 'tenant';

  // Landlord/Admin routes
  if (pathname.startsWith('/landlord') || pathname.startsWith('/admin')) {
    if (!['landlord', 'admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/landlord/dashboard', request.url));
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
