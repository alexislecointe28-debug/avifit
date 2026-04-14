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

    </div>
  )
}