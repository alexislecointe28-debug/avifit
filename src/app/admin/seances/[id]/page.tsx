import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import SeanceForm from '@/components/SeanceForm'
import ReservationManuelle from '@/components/ReservationManuelle'
import type { Seance } from '@/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditSeancePage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()

  const [{ data: seance }, { data: reservations }, { data: coachsList }] = await Promise.all([
    supabase.from('seances').select('*').eq('id', params.id).single(),
    supabase.from('reservations').select('id, client_prenom, client_nom, client_email, client_tel, montant_total, avec_licence_ffa, source, created_at').eq('seance_id', params.id).eq('statut', 'confirmed').order('created_at', { ascending: false }),
    supabase.from('coachs').select('id, prenom, nom').eq('actif', true).order('prenom'),
  ])

  if (!seance) notFound()
  const s = seance as Seance

  const pendingCount = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('seance_id', params.id)
    .eq('statut', 'pending')

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
          <SeanceForm seance={s} mode="edit" coachs={coachsList ?? []} />
        </div>

        <div>
          <ReservationManuelle
            seanceId={s.id}
            placesMax={s.places_max}
            inscrits={(reservations ?? []) as {
              id: string; client_prenom: string; client_nom: string;
              client_email: string; montant_total: number; avec_licence_ffa: boolean; source?: string
            }[]}
          />
          {(pendingCount.count ?? 0) > 0 && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5">
              <p className="text-xs font-semibold text-yellow-700">
                {pendingCount.count} réservation(s) en attente de paiement
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Liste des inscrits */}
      <div className="mt-8">
        <h2 className="text-base font-bold mb-4">
          Inscrits <span className="text-brand">{reservations?.length ?? 0}/{s.places_max}</span>
        </h2>
        {(!reservations || reservations.length === 0) ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center">
            <p className="text-sm text-gray-400 font-medium">Aucun inscrit pour le moment</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reservations.map((r, i) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-gray-900">{r.client_prenom} {r.client_nom}</div>
                  <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>{r.client_email}</span>
                    {r.client_tel && <span>📞 {r.client_tel}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-gray-900">{(r.montant_total / 100).toFixed(0)}€</div>
                  <div className="flex gap-1 mt-1 justify-end flex-wrap">
                    {r.avec_licence_ffa && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">FFA</span>}
                    {r.source === 'manuel' && <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">📞 Manuel</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
