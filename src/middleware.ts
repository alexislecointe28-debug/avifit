import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'avifit_admin'
const ADMIN_VALUE = 'authenticated'
const COACH_COOKIE = 'avifit_coach'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protection routes admin
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const cookie = req.cookies.get(ADMIN_COOKIE)?.value
    if (cookie !== ADMIN_VALUE) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Protection routes coach
  if (pathname.startsWith('/coach') && !pathname.startsWith('/coach/login')) {
    const cookie = req.cookies.get(COACH_COOKIE)?.value
    if (!cookie) {
      return NextResponse.redirect(new URL('/coach/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*'],
}
