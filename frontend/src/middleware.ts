import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

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

function homeForRole(role: string | undefined): string {
  return role === 'landlord' || role === 'admin' ? '/landlord/dashboard' : '/dashboard';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Read token from cookie (works in Edge runtime middleware)
  const token = request.cookies.get('rms_token')?.value;
  const user = readUserCookie(request.cookies.get('rms_user')?.value);

  // Allow public paths
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    // Redirect authenticated users away from auth pages
    if (token && authPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL(homeForRole(user?.role), request.url));
    }
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
