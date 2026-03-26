import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { setCoachCookie } from '@/lib/coach-auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: coach } = await supabase
    .from('coachs')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('actif', true)
    .single()

  if (!coach) return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })

  const valid = await bcrypt.compare(password, coach.password_hash)
  if (!valid) return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })

  const res = NextResponse.json({ ok: true, prenom: coach.prenom })
  setCoachCookie(res, coach.id, coach.prenom)
  return res
}
