import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminSeancesPage() {
  const supabase = createServiceClient()
  const { data: seances } = await supabase
    .from('seances')
    .select('*')
    .order('date', { ascending: true })
    .order('heure_debut', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Séances</h1>
          <p className="text-sm text-gray-500 font-medium">{seances?.length ?? 0} séances au total</p>
        </div>
        <Link href="/admin/seances/new" className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors">
          + Nouvelle séance
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Séance</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Horaire</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Places</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {seances?.map((s) => {
              const isPast = s.date < today
              const date = new Date(s.date + 'T00:00:00')
              const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
              const dispo = s.places_max - s.places_reservees
              return (
                <tr key={s.id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 ${isPast ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3.5 font-semibold capitalize">{dateStr}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{s.titre}</td>
                  <td className="px-5 py-3.5 text-gray-500 font-medium">{s.heure_debut.slice(0,5)} – {s.heure_fin.slice(0,5)}</td>
                  <td className="px-5 py-3.5 font-medium">{s.places_reservees}/{s.places_max}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.statut === 'annule' ? 'bg-gray-100 text-gray-500' :
                      s.statut === 'complet' || dispo === 0 ? 'bg-red-100 text-red-700' :
                      dispo <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {s.statut === 'annule' ? 'Annulé' : s.statut === 'complet' || dispo === 0 ? 'Complet' : `${dispo} dispo`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/seances/${s.id}`} className="text-xs font-semibold text-brand hover:underline">
                      Gérer
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!seances || seances.length === 0) && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 font-medium mb-3">Aucune séance</p>
            <Link href="/admin/seances/new" className="inline-block bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg">
              Créer la première séance
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
