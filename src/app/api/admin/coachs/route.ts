import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { prenom, nom, email, password, tarif_seance_ext, tarif_seance_adh, tarif_formule_ext, tarif_formule_adh } = await req.json()

  if (!prenom || !email || !password) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const password_hash = await bcrypt.hash(password, 10)
  const supabase = createServiceClient()

  const { data, error } = await supabase.from('coachs')
    .insert({ prenom, nom, email, password_hash, tarif_seance_ext, tarif_seance_adh, tarif_formule_ext, tarif_formule_adh })
    .select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
