import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'avifit2025'
const COOKIE_NAME = 'avifit_admin'
const COOKIE_VALUE = 'authenticated'

export function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE
}

export function checkPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function setAuthCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.delete(COOKIE_NAME)
}
