import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServiceClient()

  const today = new Date().toISOString().split('T')[0]

  const [{ count: totalSeances }, { count: totalReservations }, { count: seancesAVenir }, { data: prochainesSeances }] =
    await Promise.all([
      supabase.from('seances').select('*', { count: 'exact', head: true }),
      supabase.from('reservations').select('*', { count: 'exact', head: true }).eq('statut', 'confirmed'),
      supabase.from('seances').select('*', { count: 'exact', head: true }).gte('date', today).neq('statut', 'annule'),
      supabase.from('seances').select('*, reservations(count)').gte('date', today).neq('statut', 'annule').order('date').order('heure_debut').limit(5),
    ])

  const stats = [
    { label: 'Séances à venir', value: seancesAVenir ?? 0, color: 'text-brand' },
    { label: 'Réservations confirmées', value: totalReservations ?? 0, color: 'text-green-600' },
    { label: 'Séances totales', value: totalSeances ?? 0, color: 'text-gray-900' },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 font-medium">Bienvenue dans l&apos;administration Avifit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`text-3xl font-bold tracking-tight ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Prochaines séances */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">Prochaines séances</h2>
          <Link href="/admin/seances" className="text-sm font-medium text-brand hover:underline">
            Tout voir →
          </Link>
        </div>
        {!prochainesSeances || prochainesSeances.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 font-medium mb-3">Aucune séance à venir</p>
            <Link href="/admin/seances/new" className="inline-block bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">
              Créer une séance
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {prochainesSeances.map((s: Record<string, unknown>) => {
              const date = new Date((s.date as string) + 'T00:00:00')
              const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
              const reservations = s.reservations as { count: number }[]
              const nbInscrits = reservations?.[0]?.count ?? 0
              const dispo = (s.places_max as number) - nbInscrits
              return (
                <div key={s.id as string} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-gray-900 capitalize w-32">{dateStr}</div>
                    <div className="text-sm text-gray-600 font-medium">{s.titre as string}</div>
                    <div className="text-xs text-gray-400 font-medium">{(s.heure_debut as string).slice(0, 5)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">{nbInscrits}/{s.places_max as number}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.statut === 'complet' || dispo === 0 ? 'bg-red-100 text-red-700' :
                      dispo <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {s.statut === 'complet' || dispo === 0 ? 'Complet' : `${dispo} dispo`}
                    </span>
                    <Link href={`/admin/seances/${s.id}`} className="text-xs font-medium text-brand hover:underline">
                      Gérer
                    </Link>
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
