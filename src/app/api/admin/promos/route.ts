import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { code, description, nb_max, expire_le } = await req.json()

  if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('codes_promo')
    .insert({ code: code.toUpperCase().trim(), type: 'gratuit', valeur: 100, description, nb_max, expire_le })
    .select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Ce code existe déjà' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
