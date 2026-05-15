import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const annee = parseInt(searchParams.get('annee') ?? String(new Date().getFullYear()))
  const mois = parseInt(searchParams.get('mois') ?? String(new Date().getMonth() + 1))

  const debut = `${annee}-${String(mois).padStart(2, '0')}-01`
  const finDate = new Date(annee, mois, 0) // dernier jour du mois
  const fin = finDate.toISOString().split('T')[0]

  const supabase = createServiceClient()
  const { data: slots } = await supabase
    .from('coach_slots')
    .select('id, slot_date, heure_debut, heure_fin, nb_coachs_max, nb_reserves, statut')
    .gte('slot_date', debut)
    .lte('slot_date', fin)
    .eq('statut', 'disponible')
    .order('slot_date').order('heure_debut')

  return NextResponse.json({ slots: slots ?? [] })
}
