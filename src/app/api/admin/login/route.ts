import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/admin-auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'avifit2025'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  setAuthCookie(res)
  return res
}
