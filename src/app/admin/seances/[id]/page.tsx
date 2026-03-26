import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import SeanceForm from '@/components/SeanceForm'
import type { Seance, Reservation } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditSeancePage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()

  const [{ data: seance }, { data: reservations }] = await Promise.all([
    supabase.from('seances').select('*').eq('id', params.id).single(),
    supabase.from('reservations').select('*').eq('seance_id', params.id).order('created_at', { ascending: false }),
  ])

  if (!seance) notFound()

  const s = seance as Seance
  const resa = (reservations ?? []) as Reservation[]
  const confirmed = resa.filter(r => r.statut === 'confirmed')

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/seances" className="text-xs font-medium text-gray-400 hover:text-brand mb-3 block">← Retour aux séances</Link>
        <h1 className="text-2xl font-bold tracking-tight mb-1">{s.titre}</h1>
        <p className="text-sm text-gray-500 font-medium">
          {new Date(s.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{s.heure_debut.slice(0,5)} – {s.heure_fin.slice(0,5)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-base font-bold mb-4">Modifier la séance</h2>
          <SeanceForm seance={s} mode="edit" />
        </div>

        <div>
          <h2 className="text-base font-bold mb-4">
            Inscrits <span className="text-brand">{confirmed.length}/{s.places_max}</span>
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {confirmed.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 font-medium">Aucun inscrit pour l&apos;instant</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Participant</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Formule</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmed.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{r.client_prenom} {r.client_nom}</div>
                        <div className="text-xs text-gray-400 font-medium">{r.client_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-gray-600">{(r.montant_total / 100).toFixed(0)}€</div>
                        {r.avec_licence_ffa && <div className="text-xs text-blue-500 font-medium">+ licence FFA</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {resa.filter(r => r.statut === 'pending').length > 0 && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5">
              <p className="text-xs font-semibold text-yellow-700">
                {resa.filter(r => r.statut === 'pending').length} réservation(s) en attente de paiement
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
