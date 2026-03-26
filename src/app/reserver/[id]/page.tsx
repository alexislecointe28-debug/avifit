import Navbar from '@/components/Navbar'
import { createServiceClient } from '@/lib/supabase'
import type { Seance } from '@/types'
import { notFound } from 'next/navigation'
import ReservationForm from '@/components/ReservationForm'

function cleanTitre(titre: string) {
  return titre.replace(/\s*—\s*(Débutant|Intermédiaire|Tous niveaux|Tous les niveaux)/gi, '').trim()
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatHeure(h: string) {
  return h.slice(0, 5)
}



export default async function ReserverPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()

  const { data: seance, error } = await supabase
    .from('seances')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !seance) notFound()

  const s = seance as Seance
  const dispo = s.places_max - s.places_reservees
  const isComplet = s.statut === 'complet' || dispo === 0

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <a href="/planning" className="hover:text-brand transition-colors">Planning</a>
            <span>›</span>
            <span className="text-gray-600">Réservation</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-3">Votre séance</p>
            <h1 className="text-xl font-semibold mb-1">{cleanTitre(s.titre)}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
              <span className="capitalize">{formatDate(s.date)}</span>
              <span>·</span>
              <span>{formatHeure(s.heure_debut)} – {formatHeure(s.heure_fin)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{s.places_reservees}/{s.places_max} inscrits</span>
              {isComplet ? (
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">Complet</span>
              ) : (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {dispo} place{dispo > 1 ? 's' : ''} disponible{dispo > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {isComplet ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <p className="text-red-700 font-medium mb-2">Cette séance est complète</p>
              <p className="text-sm text-red-500 mb-4">Revenez sur le planning pour choisir un autre créneau.</p>
              <a href="/planning" className="inline-block bg-brand text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors">
                Voir le planning
              </a>
            </div>
          ) : (
            <ReservationForm seance={s} />
          )}

        </div>
      </main>
    </>
  )
}
