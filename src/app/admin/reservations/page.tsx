import { createServiceClient } from '@/lib/supabase'
import type { Reservation } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminReservationsPage() {
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Client</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Séance</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Montant</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {resa.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-gray-900">{r.client_prenom} {r.client_nom}</div>
                  <div className="text-xs text-gray-400 font-medium">{r.client_email}</div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-gray-800">{r.seances?.titre ?? '—'}</div>
                  {r.seances?.date && (
                    <div className="text-xs text-gray-400 font-medium">
                      {new Date(r.seances.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' · '}{r.seances.heure_debut.slice(0,5)}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5 font-semibold text-gray-900">
                  {(r.montant_total / 100).toFixed(0)}€
                  {r.avec_licence_ffa && <span className="text-xs text-blue-500 font-medium ml-1">+ licence</span>}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    r.statut === 'confirmed' ? 'bg-green-100 text-green-700' :
                    r.statut === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {r.statut === 'confirmed' ? 'Confirmé' : r.statut === 'pending' ? 'En attente' : 'Annulé'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 font-medium text-xs">
                  {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {resa.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400 font-medium">Aucune réservation</div>
        )}
      </div>
    </div>
  )
}
