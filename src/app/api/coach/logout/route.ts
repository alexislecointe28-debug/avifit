import { NextRequest, NextResponse } from 'next/server'
import { clearCoachCookie } from '@/lib/coach-auth'

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  clearCoachCookie(res)
  return res
}
