import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminSeancesPage() {
  noStore()
  cookies() // force bypass Vercel prerender cache
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

      <div className="flex flex-col gap-2">
        {seances?.map((s) => {
          const isPast = s.date < today
          const date = new Date(s.date + 'T00:00:00')
          const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
          const dispo = s.places_max - s.places_reservees
          const statutLabel = s.statut === 'annule' ? 'Annulé' : s.statut === 'complet' || dispo === 0 ? 'Complet' : `${dispo} dispo`
          const statutCls = s.statut === 'annule' ? 'bg-gray-100 text-gray-500' : s.statut === 'complet' || dispo === 0 ? 'bg-red-100 text-red-700' : dispo <= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
          return (
            <div key={s.id} className={`rounded-xl border px-4 py-3.5 flex items-center gap-3 ${isPast ? 'bg-gray-50 border-gray-100 opacity-40' : 'bg-white border-gray-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm capitalize text-gray-900">{dateStr}</span>
                  <span className="text-gray-400 text-xs">{s.heure_debut.slice(0,5)}–{s.heure_fin.slice(0,5)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium">{s.titre}</span>
                  <span className="text-xs text-gray-400">{s.places_reservees}/{s.places_max} inscrits</span>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statutCls}`}>{statutLabel}</span>
              <Link href={`/admin/seances/${s.id}`} className="shrink-0 text-xs font-bold text-brand border border-brand px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors">
                Gérer
              </Link>
            </div>
          )
        })}
        {(!seances || seances.length === 0) && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
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
