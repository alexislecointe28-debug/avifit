import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, setAuthCookie } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  setAuthCookie(res)
  return res
}
