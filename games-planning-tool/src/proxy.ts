//More than 50% AI generated
// Blocks routes the current role can't use
// Layout checks (requireRole / requireNsoAccess) show a 404, but Next renders
// Proxy runs first, so nothing is rendered for a blocked route.
// Optimistic check from the cookie only (no DB): the layouts still do the full checks.
import { NextResponse, type NextRequest } from 'next/server';
import { DEV_USER_COOKIE, parseDevCookie } from '@/lib/devSessionCookie';
import { isRouteAllowed } from '@/lib/routing/Navigation';

export function proxy(request: NextRequest) {
  const user = parseDevCookie(request.cookies.get(DEV_USER_COOKIE)?.value);
  // No cookie: getSession() falls back to the first admin, so allow.
  if (!user || isRouteAllowed(request.nextUrl.pathname, user)) {
    return NextResponse.next();
  }
  // Not allowed: send them to their own landing page.
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  // Skip Next internals and static files (images, icons, etc.).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)',
  ],
};
