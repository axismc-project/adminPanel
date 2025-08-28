import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pages publiques (login)
  const publicPaths = ['/login', '/api/auth/login'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Si c'est une page publique, continuer
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Pour les pages privées, vérifier seulement la présence du token
  const token = request.cookies.get('session-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // La validation complète sera faite dans les API routes et composants
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};