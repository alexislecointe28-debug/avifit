import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { seanceId, prenom, nom, email, montant } = await req.json()
  if (!seanceId || !prenom || !nom) return NextResponse.json({ error: 'Prénom et nom requis' }, { status: 400 })

  const supabase = createServiceClient()

  // Vérifier la séance et les places
  const { data: seance } = await supabase.from('seances').select('*').eq('id', seanceId).single()
  if (!seance) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })
  if (seance.places_reservees >= seance.places_max) return NextResponse.json({ error: 'Séance complète' }, { status: 409 })

  const { data, error } = await supabase.from('reservations')
    .insert({
      seance_id: seanceId,
      client_prenom: prenom,
      client_nom: nom,
      client_email: email || `manuel_${Date.now()}@avifit.local`,
      statut: 'confirmed',
      montant_total: montant ?? 0,
      avec_licence_ffa: false,
      stripe_payment_id: `manuel_${Date.now()}`,
      source: 'manuel',
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
