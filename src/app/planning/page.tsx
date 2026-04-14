import Navbar from '@/components/Navbar'
import { createServiceClient } from '@/lib/supabase'
import type { Seance } from '@/types'
import Link from 'next/link'

import { unstable_noStore as noStore } from 'next/cache'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatHeure(h: string) {
  return h.slice(0, 5)
}

function cleanTitre(titre: string) {
  return titre
    .replace(/\s*—\s*(Débutant|Intermédiaire|Tous niveaux|Tous les niveaux)/gi, '')
    .trim()
}

function tagConfig(seance: Seance) {
  const dispo = seance.places_max - seance.places_reservees
  if (seance.statut === 'complet' || dispo === 0) return { label: 'Complet', cls: 'bg-red-100 text-red-700' }
  if (dispo === 1) return { label: 'Dernière place !', cls: 'bg-red-100 text-red-700' }
  if (dispo === 2) return { label: 'Plus que 2 places', cls: 'bg-orange-100 text-orange-700' }
  if (dispo <= 4) return { label: `${dispo} places`, cls: 'bg-yellow-100 text-yellow-700' }
  return { label: `${dispo} places`, cls: 'bg-green-100 text-green-700' }
}

function isProchaine(date: string, index: number) {
  const today = new Date()
  const seanceDate = new Date(date + 'T00:00:00')
  const diffDays = Math.ceil((seanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return index === 0 && diffDays <= 7
}



// noStore appelé dans la fonction
export default async function PlanningPage() {
  noStore()
  const supabase = createServiceClient()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const { data: seances, error } = await supabase
    .from('seances')
    .select('*')
    .gte('date', today)
    .neq('statut', 'annule')
    .order('date', { ascending: true })
    .order('heure_debut', { ascending: true })

  // Filtrer côté JS : exclure les séances dont le début est dans moins d'1h
  const cutoff = new Date(now.getTime() + 60 * 60 * 1000) // now + 1h

  if (error) console.error('Supabase error:', error)
  const seancesList: Seance[] = (seances ?? []).filter((s) => {
    const debut = new Date(`${s.date}T${s.heure_debut}`)
    return debut > cutoff
  })

  // Prochaine séance dispo
  const prochaineDispo = seancesList.find(s => s.places_reservees < s.places_max)

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen pb-24 md:pb-0">
        <div className="max-w-4xl mx-auto px-6 py-12">

          <div className="mb-10">
            <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-2">Planning</p>
            <h1 className="text-3xl font-semibold tracking-tight mb-3">Réservez votre séance</h1>
            <p className="text-sm text-gray-700 font-medium">Choisissez un créneau, payez en ligne — confirmation immédiate par email.</p>
          </div>



          {seancesList.length === 0 ? (
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-brand-800 mb-2">Aucun créneau disponible</h2>
              <p className="text-sm text-brand-600">De nouveaux créneaux seront ajoutés prochainement.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {seancesList.map((seance, index) => {
                const tag = tagConfig(seance)
                const dispo = seance.places_max - seance.places_reservees
                const pct = Math.round((seance.places_reservees / seance.places_max) * 100)
                const isComplet = seance.statut === 'complet' || dispo === 0
                const isNext = isProchaine(seance.date, index)

                return (
                  <div
                    key={seance.id}
                    className={`bg-white rounded-2xl border p-5 transition-shadow ${
                      isComplet ? 'border-gray-100 opacity-70' :
                      isNext ? 'border-brand border-2 shadow-sm shadow-brand/10' :
                      'border-gray-200 hover:shadow-md hover:border-brand-200'
                    }`}
                  >
                    {isNext && !isComplet && (
                      <div className="inline-flex items-center gap-1.5 bg-brand text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Prochaine séance
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 capitalize">
                            {formatDate(seance.date)}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatHeure(seance.heure_debut)} – {formatHeure(seance.heure_fin)}
                          </span>

                        </div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <div className="text-base font-medium text-gray-800">{cleanTitre(seance.titre)}</div>
                          {(() => {
                            const tagMap: Record<string, [string, string]> = {
                              generale: ['🏋️ Générale', 'bg-gray-100 text-gray-700'],
                              renfo: ['💪 Renfo', 'bg-orange-100 text-orange-700'],
                              cardio: ['❤️ Cardio', 'bg-red-100 text-red-700'],
                              rowning: ['🚣 Rowning', 'bg-blue-100 text-blue-700'],
                            }
                            const t = seance.type_seance ?? 'generale'
                            const [label, cls] = tagMap[t] ?? tagMap.generale
                            return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
                          })()}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                          <span>1h · 10 personnes max</span>
                          <span>{(seance.prix / 100).toFixed(0)}€ / séance</span>

                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isComplet ? 'bg-red-400' : 'bg-brand'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 min-w-[70px] text-right">
                            {seance.places_reservees}/{seance.places_max} inscrits
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tag.cls}`}>
                          {tag.label}
                        </span>
                        {isComplet ? (
                          <span className="text-xs text-gray-500 font-medium">Séance complète</span>
                        ) : (
                          <Link
                            href={`/reserver/${seance.id}`}
                            className="bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors"
                          >
                            Réserver
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tarifs */}
          <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold mb-4">Tarifs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">10€</div>
                <div className="text-xs text-gray-400 mt-1">Séance à l&apos;unité</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand tracking-tight">8€<span className="text-sm font-medium text-gray-400">/sem</span></div>
                <div className="text-xs text-gray-400 mt-1">
                  <a href="/abonnement" className="text-brand font-semibold hover:underline">Formule illimitée →</a>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
              Adhérent AUNL : 5€/séance · 4€/sem en formule illimitée · Licence FFA +45€ si non-licencié
            </p>
          </div>

        </div>
      </main>

      {/* Sticky CTA mobile */}
      {prochaineDispo && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white border-t border-gray-200 shadow-lg">
          <a href={`/reserver/${prochaineDispo.id}`}
            className="block w-full bg-brand text-white font-black py-4 rounded-xl text-center text-base shadow-lg shadow-brand/20 hover:bg-brand-700 transition-colors">
            Réserver la prochaine séance →
          </a>
          <p className="text-xs text-gray-400 text-center mt-1.5">
            {new Date(prochaineDispo.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {prochaineDispo.heure_debut.slice(0, 5)} · {prochaineDispo.places_max - prochaineDispo.places_reservees} place(s) dispo
          </p>
        </div>
      )}
    </>
  )
}
