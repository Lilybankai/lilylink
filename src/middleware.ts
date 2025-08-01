import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🔍 Middleware Debug:', {
    path: request.nextUrl.pathname,
    method: request.method,
    timestamp: new Date().toISOString()
  });

  // Skip middleware for static files, API routes, and auth routes
  const skipPaths = [
    '/_next',
    '/favicon.ico',
    '/api',
    '/auth',
    '/login', // Legacy support
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email'
  ];

  const shouldSkip = skipPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (shouldSkip) {
    console.log('⏭️ Skipping middleware for:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('🔐 Auth Debug:', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userId: user?.id,
    timestamp: new Date().toISOString()
  });

  // Only redirect to login if user is not authenticated and trying to access protected routes
  if (!user) {
    console.log('🚫 No user found, redirecting to login from:', request.nextUrl.pathname);
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  console.log('✅ User authenticated, allowing access to:', request.nextUrl.pathname);

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse;
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
}; 