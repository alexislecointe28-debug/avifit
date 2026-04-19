import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('reservations')
    .select('id, seance_id, statut, montant_total, avec_licence_ffa, seances(titre, date, heure_debut, heure_fin)')
    .eq('client_email', email.toLowerCase().trim())
    .eq('statut', 'confirmed')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtrer uniquement les séances futures (côté JS, car filtre Supabase sur jointure non fiable)
  const now = new Date()
  const future = (data ?? []).filter((r: Record<string, unknown>) => {
    const s = r.seances as { date: string; heure_debut: string } | null
    if (!s) return false
    return new Date(`${s.date}T${s.heure_debut}`) > now
  })

  // Trier par date croissante
  future.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
    const sa = a.seances as { date: string; heure_debut: string }
    const sb = b.seances as { date: string; heure_debut: string }
    return new Date(`${sa.date}T${sa.heure_debut}`).getTime() - new Date(`${sb.date}T${sb.heure_debut}`).getTime()
  })

  return NextResponse.json(future)
}
