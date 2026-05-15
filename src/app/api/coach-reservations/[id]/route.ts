import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()

  const { data: resa } = await supabase
    .from('coach_reservations')
    .select('*, coach_slots(date, heure_debut)')
    .eq('id', params.id)
    .eq('statut', 'confirmed')
    .single()

  if (!resa) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })

  // Vérifier délai 2h avant
  const slot = resa.coach_slots as { date: string; heure_debut: string }
  const debut = new Date(`${slot.date}T${slot.heure_debut}`)
  const cutoff = new Date(Date.now() + 2 * 60 * 60 * 1000)
  if (debut <= cutoff) {
    return NextResponse.json({ error: 'Annulation impossible moins de 2h avant le créneau' }, { status: 409 })
  }

  await supabase.from('coach_reservations')
    .update({ statut: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', params.id)

  // Restituer le crédit
  const { data: credit } = await supabase.from('coach_credits').select('nb_heures_restantes').eq('id', resa.credit_id).single()
  if (credit) {
    await supabase.from('coach_credits').update({ nb_heures_restantes: credit.nb_heures_restantes + 1 }).eq('id', resa.credit_id)
  }

  // Décrémenter nb_reserves du slot
  const { data: sl } = await supabase.from('coach_slots').select('nb_reserves').eq('id', resa.slot_id).single()
  if (sl) {
    await supabase.from('coach_slots').update({ nb_reserves: Math.max(0, sl.nb_reserves - 1) }).eq('id', resa.slot_id)
  }

  return NextResponse.json({ ok: true })
}
