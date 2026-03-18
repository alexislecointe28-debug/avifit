import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'avifit2025'
const COOKIE_NAME = 'avifit_admin'

export function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get(COOKIE_NAME)?.value === ADMIN_PASSWORD
}

export function setAuthCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  })
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.delete(COOKIE_NAME)
}
