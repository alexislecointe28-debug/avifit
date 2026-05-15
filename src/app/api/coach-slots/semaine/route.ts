import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lundi = searchParams.get('lundi')
  if (!lundi) return NextResponse.json({ error: 'Paramètre lundi requis' }, { status: 400 })

  const supabase = createServiceClient()
  const dimanche = new Date(lundi + 'T00:00:00')
  dimanche.setDate(dimanche.getDate() + 6)

  const { data: slots } = await supabase
    .from('coach_slots')
    .select('id, date, heure_debut, heure_fin, nb_coachs_max, nb_reserves, statut')
    .gte('date', lundi)
    .lte('date', dimanche.toISOString().split('T')[0])
    .eq('statut', 'disponible')
    .order('date').order('heure_debut')

  return NextResponse.json({ slots: slots ?? [] })
}
