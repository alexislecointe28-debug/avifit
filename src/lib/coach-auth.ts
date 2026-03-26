import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'avifit_coach'

export function getCoachSession(req: NextRequest): { id: string; prenom: string } | null {
  const val = req.cookies.get(COOKIE_NAME)?.value
  if (!val) return null
  try {
    return JSON.parse(atob(val))
  } catch {
    return null
  }
}

export function setCoachCookie(res: NextResponse, id: string, prenom: string): void {
  const val = btoa(JSON.stringify({ id, prenom }))
  res.cookies.set(COOKIE_NAME, val, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearCoachCookie(res: NextResponse): void {
  res.cookies.delete(COOKIE_NAME)
}
