import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { reservationId, email } = await req.json()
  if (!reservationId || !email) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  const supabase = createServiceClient()

  // Récupérer la réservation avec la séance
  const { data: resa, error } = await supabase
    .from('reservations')
    .select('*, seances(date, heure_debut)')
    .eq('id', reservationId)
    .eq('client_email', email.toLowerCase().trim())
    .eq('statut', 'confirmed')
    .single()

  if (error || !resa) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })

  // Vérification 24h côté serveur
  const s = resa.seances as { date: string; heure_debut: string }
  const debut = new Date(`${s.date}T${s.heure_debut}`)
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000)

  if (debut <= cutoff) {
    return NextResponse.json({
      error: 'Annulation impossible — la séance est dans moins de 24h. Le prélèvement est maintenu.'
    }, { status: 400 })
  }

  // Annuler la réservation
  const { error: updateError } = await supabase
    .from('reservations')
    .update({ statut: 'cancelled' })
    .eq('id', reservationId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
