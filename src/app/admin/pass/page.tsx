import { createServiceClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminPassPage() {
  noStore()
  cookies()
  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: passActifs } = await supabase
    .from('pass_seances')
    .select('*')
    .eq('statut', 'actif')
    .gte('expire_le', today)
    .order('expire_le', { ascending: true })

  const { data: passExpires } = await supabase
    .from('pass_seances')
    .select('*')
    .or(`statut.eq.expire,expire_le.lt.${today}`)
    .order('expire_le', { ascending: false })
    .limit(20)

  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Pass Séances</h1>
        <p className="text-sm text-gray-500 font-medium">{passActifs?.length ?? 0} pass actifs</p>
      </div>

      {/* Pass actifs */}
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Actifs</h2>
      <div className="flex flex-col gap-2 mb-8">
        {(!passActifs || passActifs.length === 0) ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-8 text-center text-sm text-gray-400">Aucun pass actif</div>
        ) : passActifs.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-gray-900">{p.client_prenom} {p.client_nom}</div>
              <div className="text-xs text-gray-400 mt-0.5">{p.client_email}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-black text-brand text-lg">{p.nb_seances_restantes}<span className="text-xs text-gray-400 font-normal">/{p.nb_seances_total}</span></div>
              <div className="text-xs text-gray-400">expire {fmt(p.expire_le)}</div>
            </div>
            {p.est_adherent && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">AUNL</span>}
          </div>
        ))}
      </div>

      {/* Pass expirés */}
      {passExpires && passExpires.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Expirés / utilisés</h2>
          <div className="flex flex-col gap-2 opacity-50">
            {passExpires.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-700">{p.client_prenom} {p.client_nom}</div>
                  <div className="text-xs text-gray-400">{p.client_email}</div>
                </div>
                <div className="text-right shrink-0 text-xs text-gray-400">
                  {p.nb_seances_restantes}/{p.nb_seances_total} · exp. {fmt(p.expire_le)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
