import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import DashboardFinancier from '@/components/DashboardFinancier'

export const dynamic = 'force-dynamic'

function getMoisEnCours() {
  const now = new Date()
  const debut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const fin   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { debut, fin, label: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }
}

export default async function AdminPage() {
  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const mois = getMoisEnCours()

  const [
    { data: coachs },
    { data: toutesReservations },
    { data: seancesAVenir },
    { count: nbSeancesAVenir },
    { data: prochaines5 },
  ] = await Promise.all([
    supabase.from('coachs').select('*').eq('actif', true).order('prenom'),
    supabase.from('reservations')
      .select('montant_total, seances(date, coach_id)')
      .eq('statut', 'confirmed'),
    supabase.from('seances')
      .select('*, reservations(montant_total, statut)')
      .gte('date', today)
      .lte('date', mois.fin)
      .neq('statut', 'annule')
      .order('date').order('heure_debut'),
    supabase.from('seances').select('*', { count: 'exact', head: true }).gte('date', today).neq('statut', 'annule'),
    supabase.from('seances').select('*, reservations(count)').gte('date', today).neq('statut', 'annule').order('date').order('heure_debut').limit(5),
  ])

  // Filtrer ce mois
  const resaMois = (toutesReservations ?? []).filter(r => {
    const s = r.seances as unknown as { date: string; coach_id: string | null } | null
    return s && s.date >= mois.debut && s.date <= mois.fin
  })

  // Calcul par coach
  const coachsMap = Object.fromEntries((coachs ?? []).map(c => [c.id, c]))

  interface CoachStats {
    prenom: string; nom: string;
    gains: number; nbResa: number;
    nbExt: number; nbAdh: number; nbFormExt: number; nbFormAdh: number;
  }
  const statsByCoach: Record<string, CoachStats> = {}
  let totalEncaisse = 0, totalClub = 0, totalCoachs = 0, nbSansCoach = 0

  for (const r of resaMois) {
    const seance = r.seances as unknown as { date: string; coach_id: string | null } | null
    const coachId = seance?.coach_id ?? null
    const montant = (r.montant_total as number) ?? 0
    totalEncaisse += montant

    const coach = coachId ? coachsMap[coachId] : null
    if (!coach || !coachId) { nbSansCoach++; totalClub += montant; continue }

    if (!statsByCoach[coachId]) {
      statsByCoach[coachId] = { prenom: coach.prenom, nom: coach.nom, gains: 0, nbResa: 0, nbExt: 0, nbAdh: 0, nbFormExt: 0, nbFormAdh: 0 }
    }

    let coachGain = 0
    if (montant >= 1000)      { coachGain = coach.tarif_seance_ext;   statsByCoach[coachId].nbExt++ }
    else if (montant === 800) { coachGain = coach.tarif_formule_ext;  statsByCoach[coachId].nbFormExt++ }
    else if (montant === 500) { coachGain = coach.tarif_seance_adh;   statsByCoach[coachId].nbAdh++ }
    else if (montant === 400) { coachGain = coach.tarif_formule_adh;  statsByCoach[coachId].nbFormAdh++ }

    statsByCoach[coachId].gains += coachGain
    statsByCoach[coachId].nbResa++
    totalCoachs += coachGain
    totalClub += montant - coachGain
  }

  // Prévisionnel
  let prevTotal = 0, prevCoachs = 0, prevClub = 0
  for (const s of seancesAVenir ?? []) {
    const coachId = (s.coach_id as string | null)
    const coach = coachId ? coachsMap[coachId] : null
    for (const r of (s.reservations as { montant_total: number; statut: string }[] ?? [])) {
      if (r.statut !== 'confirmed') continue
      const m = r.montant_total ?? 0
      prevTotal += m
      let cGain = 0
      if (coach) {
        if (m >= 1000)      cGain = coach.tarif_seance_ext
        else if (m === 800) cGain = coach.tarif_formule_ext
        else if (m === 500) cGain = coach.tarif_seance_adh
        else if (m === 400) cGain = coach.tarif_formule_adh
      }
      prevCoachs += cGain
      prevClub += m - cGain
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 font-medium capitalize">{mois.label}</p>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total encaissé</div>
          <div className="text-3xl font-black text-gray-900">{(totalEncaisse / 100).toFixed(0)}€</div>
          <div className="text-xs text-gray-400 mt-1">via Stripe → AUNL</div>
        </div>
        <div className="bg-brand-50 rounded-xl border border-brand-100 p-5">
          <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Total coachs</div>
          <div className="text-3xl font-black text-brand">{(totalCoachs / 100).toFixed(0)}€</div>
          <div className="text-xs text-brand-500 mt-1">à refacturer ce mois</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Net club</div>
          <div className="text-3xl font-black text-gray-700">{(totalClub / 100).toFixed(0)}€</div>
          {nbSansCoach > 0 && <div className="text-xs text-orange-500 mt-1">{nbSansCoach} résas sans coach attribué</div>}
        </div>
      </div>

      {/* Par coach — composant client pour le filtre */}
      <DashboardFinancier
        statsByCoach={statsByCoach}
        prevTotal={prevTotal}
        prevCoachs={prevCoachs}
        prevClub={prevClub}
        moisLabel={mois.label}
      />

      {/* Stats + Prochaines séances */}
      <div className="grid grid-cols-2 gap-4 mb-5 mt-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-3xl font-bold text-brand tracking-tight">{nbSeancesAVenir ?? 0}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Séances à venir</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-3xl font-bold text-green-600 tracking-tight">{resaMois.length}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Réservations ce mois</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">Prochaines séances</h2>
          <Link href="/admin/seances" className="text-sm font-medium text-brand hover:underline">Tout voir →</Link>
        </div>
        {!prochaines5?.length ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-3">Aucune séance à venir</p>
            <Link href="/admin/seances/new" className="inline-block bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg">Créer une séance</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {prochaines5.map((s: Record<string, unknown>) => {
              const date = new Date((s.date as string) + 'T00:00:00')
              const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
              const reservations = s.reservations as { count: number }[]
              const nbInscrits = reservations?.[0]?.count ?? 0
              const dispo = (s.places_max as number) - nbInscrits
              return (
                <div key={s.id as string} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-0 gap-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="text-sm font-semibold text-gray-900 capitalize sm:w-32">{dateStr}</div>
                    <div className="text-sm text-gray-600">{s.titre as string}</div>
                    <div className="text-xs text-gray-400">{(s.heure_debut as string).slice(0, 5)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">{nbInscrits}/{s.places_max as number}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dispo === 0 ? 'bg-red-100 text-red-700' : dispo <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {dispo === 0 ? 'Complet' : `${dispo} dispo`}
                    </span>
                    <Link href={`/admin/seances/${s.id}`} className="text-xs font-medium text-brand hover:underline">Gérer</Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
