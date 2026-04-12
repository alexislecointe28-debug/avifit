import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('seances').select('*').order('date').order('heure_debut')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await req.json()
  const { titre, type, date, heure_debut, heure_fin, places_max, prix, type_seance } = body

  if (!titre || !type || !date || !heure_debut || !heure_fin) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('seances')
    .insert({ titre, type, date, heure_debut, heure_fin, places_max: places_max ?? 10, prix: prix ?? 1000, statut: 'disponible', type_seance: type_seance ?? 'generale' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
