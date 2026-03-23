import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendRappelSeance } from '@/lib/emails'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)
  const dateMin = in24h.toISOString().split('T')[0]
  const dateMax = in25h.toISOString().split('T')[0]

  const { data: seances } = await supabase
    .from('seances')
    .select('*, reservations(client_email, client_prenom, statut)')
    .gte('date', dateMin)
    .lte('date', dateMax)
    .neq('statut', 'annule')

  if (!seances || seances.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  for (const seance of seances) {
    const debutSeance = new Date(`${seance.date}T${seance.heure_debut}`)
    if (debutSeance < in24h || debutSeance > in25h) continue

    const reservations = (seance.reservations as { client_email: string; client_prenom: string; statut: string }[]) ?? []
    for (const resa of reservations) {
      if (resa.statut !== 'confirmed') continue
      try {
        await sendRappelSeance({
          to: resa.client_email,
          prenom: resa.client_prenom,
          titre: seance.titre,
          date: seance.date,
          heureDebut: seance.heure_debut,
          heureFin: seance.heure_fin,
        })
        sent++
      } catch (err) {
        console.error('Rappel error:', err)
      }
    }
  }

  return NextResponse.json({ sent })
}
