import { createServiceClient } from '@/lib/supabase'
import type { Reservation } from '@/types'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminReservationsPage() {
  noStore()
  cookies()
  const supabase = createServiceClient()

  const { data: reservations } = await supabase
    .from('reservations')
    .select('*, seances(titre, date, heure_debut)')
    .order('created_at', { ascending: false })
    .limit(100)

  const resa = (reservations ?? []) as (Reservation & { seances: { titre: string; date: string; heure_debut: string } | null })[]

  const confirmed = resa.filter(r => r.statut === 'confirmed').length
  const pending = resa.filter(r => r.statut === 'pending').length
  const revenue = resa.filter(r => r.statut === 'confirmed').reduce((sum, r) => sum + r.montant_total, 0)

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Réservations</h1>
        <p className="text-sm text-gray-500 font-medium">{resa.length} réservations au total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-3xl font-bold text-green-600">{confirmed}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Confirmées</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-3xl font-bold text-yellow-600">{pending}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">En attente</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-3xl font-bold text-brand">{(revenue / 100).toFixed(0)}€</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Chiffre d&apos;affaires</div>
        </div>
      </div>

      {/* Cartes réservations */}
      <div className="flex flex-col gap-2">
        {resa.map((r) => {
          const statutCls = r.statut === 'confirmed' ? 'bg-green-100 text-green-700' : r.statut === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
          const statutLabel = r.statut === 'confirmed' ? 'Confirmé' : r.statut === 'pending' ? 'En attente' : 'Annulé'
          return (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900">{r.client_prenom} {r.client_nom}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{r.client_email}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm text-gray-900">{(r.montant_total / 100).toFixed(0)}€</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statutCls}`}>{statutLabel}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                {r.seances?.titre && <span className="font-medium text-gray-600">{r.seances.titre}</span>}
                {r.seances?.date && <span>{new Date(r.seances.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {r.seances.heure_debut.slice(0,5)}</span>}
                <span>{new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                {r.avec_licence_ffa && <span className="font-bold text-blue-600">FFA</span>}
              </div>
            </div>
          )
        })}
        {resa.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-sm text-gray-400 font-medium">Aucune réservation</div>
        )}
      </div>
    </div>
  )
}
