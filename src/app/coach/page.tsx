import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

function getMoisEnCours() {
  const now = new Date()
  const debut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const fin   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  return { debut, fin, label: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }
}

export default async function CoachDashboard() {
  const cookieStore = cookies()
  const cookieVal = cookieStore.get('avifit_coach')?.value
  if (!cookieVal) redirect('/coach/login')

  let session: { id: string; prenom: string } | null = null
  try { session = JSON.parse(atob(cookieVal)) } catch { redirect('/coach/login') }
  if (!session) redirect('/coach/login')

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const mois = getMoisEnCours()

  // Récupérer le coach
  const { data: coach } = await supabase.from('coachs').select('*').eq('id', session.id).single()
  if (!coach) redirect('/coach/login')

  // Séances à venir de ce coach
  const { data: seancesAVenir } = await supabase
    .from('seances')
    .select('*, reservations(count)')
    .eq('coach_id', session.id)
    .gte('date', today)
    .neq('statut', 'annule')
    .order('date').order('heure_debut')
    .limit(10)

  // Réservations ce mois pour ce coach
  const { data: seancesMois } = await supabase
    .from('seances')
    .select('*, reservations(montant_total, statut)')
    .eq('coach_id', session.id)
    .gte('date', mois.debut)
    .lte('date', mois.fin)
    .neq('statut', 'annule')

  let gainsMois = 0, nbResaMois = 0
  for (const s of seancesMois ?? []) {
    for (const r of (s.reservations as { montant_total: number; statut: string }[] ?? [])) {
      if (r.statut !== 'confirmed') continue
      const m = r.montant_total ?? 0
      if (m >= 1000) { gainsMois += coach.tarif_seance_ext; nbResaMois++ }
      else if (m === 800) { gainsMois += coach.tarif_formule_ext; nbResaMois++ }
      else if (m === 500) { gainsMois += coach.tarif_seance_adh; nbResaMois++ }
      else if (m === 400) { gainsMois += coach.tarif_formule_adh; nbResaMois++ }
    }
  }

  const fmt = (cents: number) => (cents / 100).toFixed(2) + '€'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar coach */}
      <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/avifit-logo.png" alt="Avifit" width={80} height={26} className="h-7 w-auto" />
          <span className="text-xs text-gray-400 font-medium border-l border-gray-200 pl-3">Espace coach</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">👋 {coach.prenom}</span>
          <form action="/api/coach/logout" method="POST">
            <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 font-medium">Déconnexion</button>
          </form>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Bonjour {coach.prenom} 👋</h1>
          <p className="text-sm text-gray-500 font-medium capitalize">{mois.label}</p>
        </div>

        {/* Stats du mois */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-black text-brand tracking-tight">{fmt(gainsMois)}</div>
            <div className="text-sm text-gray-500 font-medium mt-1">Tes gains ce mois</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-black text-gray-900 tracking-tight">{nbResaMois}</div>
            <div className="text-sm text-gray-500 font-medium mt-1">Séances encadrées</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-black text-gray-900 tracking-tight">{seancesAVenir?.length ?? 0}</div>
            <div className="text-sm text-gray-500 font-medium mt-1">Séances à venir</div>
          </div>
        </div>

        {/* Règle financière */}
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mb-8">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">Ta règle financière</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Séance ext.', fmt(coach.tarif_seance_ext), 'sur 10€'],
              ['Séance adh.', fmt(coach.tarif_seance_adh), 'sur 5€'],
              ['Formule ext.', fmt(coach.tarif_formule_ext), 'sur 8€'],
              ['Formule adh.', fmt(coach.tarif_formule_adh), 'sur 4€'],
            ].map(([label, montant, base]) => (
              <div key={label} className="bg-white rounded-lg p-3 border border-brand-100">
                <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
                <div className="text-lg font-black text-brand">{montant}</div>
                <div className="text-xs text-gray-400">{base}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Séances à venir */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold mb-5">Tes prochaines séances</h2>
          {!seancesAVenir || seancesAVenir.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucune séance attribuée pour le moment</p>
          ) : (
            <div className="flex flex-col gap-2">
              {seancesAVenir.map((s: Record<string, unknown>) => {
                const date = new Date((s.date as string) + 'T00:00:00')
                const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
                const reservations = s.reservations as { count: number }[]
                const nbInscrits = reservations?.[0]?.count ?? 0
                const dispo = (s.places_max as number) - nbInscrits
                return (
                  <div key={s.id as string} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                      <div className="text-sm font-semibold text-gray-900 capitalize min-w-[180px]">{dateStr}</div>
                      <div className="text-xs text-gray-400">{(s.heure_debut as string).slice(0, 5)} – {(s.heure_fin as string).slice(0, 5)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">{nbInscrits}/{s.places_max as number} inscrits</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        dispo === 0 ? 'bg-red-100 text-red-700' :
                        dispo <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {dispo === 0 ? 'Complet' : `${dispo} dispo`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
