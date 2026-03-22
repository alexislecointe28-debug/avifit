import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('reservations')
    .select('id, seance_id, statut, montant_total, avec_licence_ffa, seances(titre, date, heure_debut, heure_fin)')
    .eq('client_email', email.toLowerCase().trim())
    .eq('statut', 'confirmed')
    .gte('seances.date', today)
    .order('seances(date)', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtrer uniquement les séances futures
  const future = (data ?? []).filter((r: Record<string, unknown>) => {
    const s = r.seances as { date: string; heure_debut: string } | null
    if (!s) return false
    const debut = new Date(`${s.date}T${s.heure_debut}`)
    return debut > new Date()
  })

  return NextResponse.json(future)
}
