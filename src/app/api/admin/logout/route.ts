import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  clearAuthCookie(res)
  return res
}
