import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TARIFS = {
  exterieur:          { seance: 10, coach: 600,  club: 400  }, // 10€ → 6€ / 4€
  adherent:           { seance: 5,  coach: 300,  club: 200  }, // 5€  → 3€ / 2€
  formule_ext:        { seance: 8,  coach: 480,  club: 320  }, // 8€  → 4.80€ / 3.20€
  formule_adh:        { seance: 4,  coach: 240,  club: 160  }, // 4€  → 2.40€ / 1.60€
}

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

  const { data: resaMois } = await supabase
    .from('reservations')
    .select('montant_total, seances(date)')
    .eq('statut', 'confirmed')

  // Filtrer ce mois côté JS (les joins Supabase sur les filtres de relation sont limités)
  const resaMoisFiltered = (resaMois ?? []).filter((r: Record<string, unknown>) => {
    const s = r.seances as { date: string } | null
    return s && s.date >= mois.debut && s.date <= mois.fin
  })

  let coachMois = 0, clubMois = 0, totalMois = 0
  let nbExtMois = 0, nbAdhMois = 0

  let nbFormuleExtMois = 0, nbFormuleAdhMois = 0

  for (const r of resaMoisFiltered) {
    const montant = (r.montant_total as number) ?? 0
    if (montant >= 1000) {
      coachMois += TARIFS.exterieur.coach; clubMois += TARIFS.exterieur.club
      totalMois += montant; nbExtMois++
    } else if (montant === 800) {
      coachMois += TARIFS.formule_ext.coach; clubMois += TARIFS.formule_ext.club
      totalMois += montant; nbFormuleExtMois++
    } else if (montant === 500) {
      coachMois += TARIFS.adherent.coach; clubMois += TARIFS.adherent.club
      totalMois += montant; nbAdhMois++
    } else if (montant === 400) {
      coachMois += TARIFS.formule_adh.coach; clubMois += TARIFS.formule_adh.club
      totalMois += montant; nbFormuleAdhMois++
    }
  }

  // Prévisionnel : réservations sur séances à venir ce mois
  const { data: seancesAVenir } = await supabase
    .from('seances')
    .select('*, reservations(montant_total, statut)')
    .gte('date', today)
    .lte('date', mois.fin)
    .neq('statut', 'annule')
    .order('date').order('heure_debut')

  let coachPrev = 0, clubPrev = 0, totalPrev = 0
  for (const s of seancesAVenir ?? []) {
    for (const r of (s.reservations as { montant_total: number; statut: string }[] ?? [])) {
      if (r.statut !== 'confirmed') continue
      const m = r.montant_total ?? 0
      if (m >= 1000)      { coachPrev += TARIFS.exterieur.coach;   clubPrev += TARIFS.exterieur.club;   totalPrev += m }
      else if (m === 800) { coachPrev += TARIFS.formule_ext.coach;  clubPrev += TARIFS.formule_ext.club;  totalPrev += m }
      else if (m === 500) { coachPrev += TARIFS.adherent.coach;     clubPrev += TARIFS.adherent.club;     totalPrev += m }
      else if (m === 400) { coachPrev += TARIFS.formule_adh.coach;  clubPrev += TARIFS.formule_adh.club;  totalPrev += m }
    }
  }

  const [
    { count: totalConfirmed },
    { count: nbSeancesAVenir },
    { data: prochaines5 },
  ] = await Promise.all([
    supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('statut', 'confirmed'),
    supabase.from('seances').select('*', { count: 'exact', head: true }).gte('date', today).neq('statut', 'annule'),
    supabase.from('seances').select('*, reservations(count)').gte('date', today).neq('statut', 'annule').order('date').order('heure_debut').limit(5),
  ])

  const fmt = (cents: number) => (cents / 100).toFixed(0) + '€'

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 font-medium capitalize">{mois.label}</p>
      </div>

      {/* FINANCIER MOIS EN COURS */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold">Répartition financière — mois en cours</h2>
            <p className="text-xs text-gray-400 mt-0.5">{nbExtMois + nbAdhMois + nbFormuleExtMois + nbFormuleAdhMois} réservations · {nbExtMois} séance ext · {nbAdhMois} séance adh · {nbFormuleExtMois} formule ext · {nbFormuleAdhMois} formule adh</p>
          </div>
          <span className="text-xs font-semibold bg-brand-50 text-brand px-3 py-1 rounded-full border border-brand-100 capitalize">{mois.label}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Encaissé total</div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{fmt(totalMois)}</div>
            <div className="text-xs text-gray-400 mt-1">via Stripe → AUNL</div>
          </div>
          <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
            <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2">À refacturer au club</div>
            <div className="text-3xl font-black text-brand tracking-tight">{fmt(coachMois)}</div>
            <div className="text-xs text-brand-500 mt-1">6€/séance ext · 3€/séance adh</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Revient au club</div>
            <div className="text-3xl font-black text-gray-700 tracking-tight">{fmt(clubMois)}</div>
            <div className="text-xs text-gray-400 mt-1">4€/séance ext · 2€/séance adh</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <div>
              <div className="text-sm font-bold">Séances extérieurs</div>
              <div className="text-xs text-gray-400">{nbExtMois} × 10€ · toi : 6€ · club : 4€</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-brand">{fmt(nbExtMois * 600)}</div>
              <div className="text-xs text-gray-400">à refacturer</div>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <div>
              <div className="text-sm font-bold">Séances adhérents</div>
              <div className="text-xs text-gray-400">{nbAdhMois} × 5€ · toi : 3€ · club : 2€</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-brand">{fmt(nbAdhMois * 300)}</div>
              <div className="text-xs text-gray-400">à refacturer</div>
            </div>
          </div>
        </div>
      </div>

      {/* PRÉVISIONNEL FIN DE MOIS */}
      {(seancesAVenir?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
          <h2 className="text-base font-bold mb-1">Prévisionnel fin de mois</h2>
          <p className="text-xs text-gray-400 mb-5">Basé sur les réservations confirmées pour les séances à venir ce mois</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total prévu</div>
              <div className="text-2xl font-black text-gray-900">{fmt(totalPrev)}</div>
            </div>
            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Ta part prévue</div>
              <div className="text-2xl font-black text-brand">{fmt(coachPrev)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Part club prévue</div>
              <div className="text-2xl font-black text-gray-700">{fmt(clubPrev)}</div>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-3xl font-bold text-brand tracking-tight">{nbSeancesAVenir ?? 0}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Séances à venir</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-3xl font-bold text-green-600 tracking-tight">{totalConfirmed ?? 0}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Réservations confirmées</div>
        </div>
      </div>

      {/* PROCHAINES SÉANCES */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">Prochaines séances</h2>
          <Link href="/admin/seances" className="text-sm font-medium text-brand hover:underline">Tout voir →</Link>
        </div>
        {!prochaines5 || prochaines5.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 font-medium mb-3">Aucune séance à venir</p>
            <Link href="/admin/seances/new" className="inline-block bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">Créer une séance</Link>
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
                    <div className="text-sm text-gray-600 font-medium">{s.titre as string}</div>
                    <div className="text-xs text-gray-400 font-medium">{(s.heure_debut as string).slice(0, 5)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">{nbInscrits}/{s.places_max as number}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      dispo === 0 ? 'bg-red-100 text-red-700' :
                      dispo <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
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
