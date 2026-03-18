import Navbar from '@/components/Navbar'
import { createServiceClient } from '@/lib/supabase'
import type { Seance } from '@/types'
import { notFound } from 'next/navigation'
import ReservationForm from '@/components/ReservationForm'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatHeure(h: string) {
  return h.slice(0, 5)
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    avifit_debutant: 'bg-blue-50 text-blue-600',
    avifit_intermediaire: 'bg-purple-50 text-purple-600',
    avifit_tous_niveaux: 'bg-teal-50 text-teal-600',
  }
  return map[type] ?? 'bg-gray-100 text-gray-600'
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    avifit_debutant: 'Débutant',
    avifit_intermediaire: 'Intermédiaire',
    avifit_tous_niveaux: 'Tous niveaux',
  }
  return map[type] ?? type
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
      <main className="bg-gray-50 min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Back */}
          <a href="/planning" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au planning
          </a>

          {/* Récap séance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeBadge(s.type)} mb-3 inline-block`}>
                  {typeLabel(s.type)}
                </span>
                <h1 className="text-xl font-semibold text-gray-900">{s.titre}</h1>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900">{(s.prix / 100).toFixed(0)}€</div>
                <div className="text-xs text-gray-400">par séance</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="capitalize">{formatDate(s.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatHeure(s.heure_debut)} – {formatHeure(s.heure_fin)} (1h)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{dispo > 0 ? `${dispo} place${dispo > 1 ? 's' : ''} disponible${dispo > 1 ? 's' : ''}` : 'Complet'}</span>
              </div>
            </div>
          </div>

          {/* Formulaire ou complet */}
          {isComplet ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Cette séance est complète</h2>
              <p className="text-sm text-red-600 mb-4">Toutes les places ont été réservées.</p>
              <a href="/planning" className="inline-block bg-brand text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors">
                Voir les autres créneaux
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
