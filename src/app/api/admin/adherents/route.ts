import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const supabase = createServiceClient()
  const { data } = await supabase.from('adherents').select('*').order('nom')
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { email, nom, prenom } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('adherents')
    .insert({ email: email.toLowerCase().trim(), nom: nom || null, prenom: prenom || null })
    .select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Cet email est déjà adhérent' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
