import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// GET — tous les slots d'une semaine (admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lundi = searchParams.get('lundi') // 'YYYY-MM-DD'
  if (!lundi) return NextResponse.json({ error: 'Paramètre lundi requis' }, { status: 400 })

  const supabase = createServiceClient()
  const dimanche = new Date(lundi)
  dimanche.setDate(dimanche.getDate() + 6)

  const { data: slots } = await supabase
    .from('coach_slots')
    .select(`*, coach_reservations(id, coach_nom, coach_prenom, coach_email, coach_structure, statut, created_at)`)
    .gte('slot_date', lundi)
    .lte('slot_date', dimanche.toISOString().split('T')[0])
    .order('slot_date').order('heure_debut')

  return NextResponse.json({ slots: slots ?? [] })
}

// POST — créer des slots (avec récurrence)
export async function POST(req: NextRequest) {
  const { date, heureDebut, heureFin, recurrence, nbSemaines } = await req.json()

  if (!date || !heureDebut || !heureFin) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Générer les blocs d'1h entre heureDebut et heureFin
  function genBlocs(dateStr: string): { slot_date: string; heure_debut: string; heure_fin: string }[] {
    const blocs = []
    let h = parseInt(heureDebut.split(':')[0])
    const hFin = parseInt(heureFin.split(':')[0])
    while (h < hFin) {
      blocs.push({
        slot_date: dateStr,
        heure_debut: `${String(h).padStart(2, '0')}:00`,
        heure_fin: `${String(h + 1).padStart(2, '0')}:00`,
      })
      h++
    }
    return blocs
  }

  const toInsert: { slot_date: string; heure_debut: string; heure_fin: string }[] = []
  const baseDate = new Date(date + 'T00:00:00')

  if (recurrence === 'aucune') {
    toInsert.push(...genBlocs(date))
  } else if (recurrence === 'hebdo') {
    const n = parseInt(nbSemaines ?? '4')
    for (let w = 0; w < n; w++) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() + w * 7)
      toInsert.push(...genBlocs(d.toISOString().split('T')[0]))
    }
  } else if (recurrence === 'ouvrables') {
    const n = parseInt(nbSemaines ?? '4')
    for (let w = 0; w < n; w++) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() + w * 7)
      const jourSemaine = d.getDay() // 0=dim, 1=lun... 5=ven, 6=sam
      if (jourSemaine >= 1 && jourSemaine <= 5) {
        // Générer pour lundi→vendredi de cette semaine
        const lundi = new Date(d)
        lundi.setDate(d.getDate() - (d.getDay() - 1))
        for (let j = 0; j < 5; j++) {
          const jour = new Date(lundi)
          jour.setDate(lundi.getDate() + j)
          toInsert.push(...genBlocs(jour.toISOString().split('T')[0]))
        }
      } else {
        toInsert.push(...genBlocs(d.toISOString().split('T')[0]))
      }
    }
  }

  // Dédupliquer
  const map = new Map(toInsert.map(s => [`${s.slot_date}-${s.heure_debut}`, s]))
  const unique = Array.from(map.values())

  const { data, error } = await supabase.from('coach_slots').insert(unique).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ created: data?.length ?? 0, slots: data })
}
