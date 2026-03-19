import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getRateLimit, logSecurityEvent } from '@/lib/rate-limit'

// Rotas que exigem autenticação
const protectedRoutes = ['/dashboard', '/studio']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session
  const { data: { user } } = await supabase.auth.getUser()

  // Proteção de rotas: redireciona para /login se não autenticado
  const pathname = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Proteção Global de Camada 1: Rate Limiting baseado em IP via Middleware
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/api/')) {
    const rateLimit = getRateLimit('ip');
    if (rateLimit) {
      // Identificação via x-forwarded-for ou request.ip
      const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const { success } = await rateLimit.limit(`ip_${ip}`);
      
      if (!success) {
        logSecurityEvent('rate_limit_exceeded', { layer: 'middleware', ip, path: pathname });
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment.' },
          { status: 429 }
        );
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
