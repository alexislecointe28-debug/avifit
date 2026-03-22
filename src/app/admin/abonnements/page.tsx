import { createServiceClient } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminAbonnementsPage() {
  const supabase = createServiceClient()
  const { data: abonnements } = await supabase
    .from('abonnements')
    .select('*')
    .order('created_at', { ascending: false })

  const actifs = abonnements?.filter(a => a.statut === 'active') ?? []
  const revenus = actifs.reduce((s: number, a: {montant_semaine: number}) => s + a.montant_semaine, 0)

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Abonnements</h1>
        <p className="text-sm text-gray-500 font-medium">{actifs.length} abonné{actifs.length > 1 ? 's' : ''} actif{actifs.length > 1 ? 's' : ''} — {(revenus / 100).toFixed(0)}€/semaine</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="text-3xl font-bold text-brand">{actifs.length}</div><div className="text-sm text-gray-500 font-medium mt-1">Abonnés actifs</div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="text-3xl font-bold text-green-600">{(revenus / 100).toFixed(0)}€</div><div className="text-sm text-gray-500 font-medium mt-1">Revenus / semaine</div></div>
        <div className="bg-white rounded-xl border border-gray-200 p-5"><div className="text-3xl font-bold text-gray-900">{((revenus / 100) * 4).toFixed(0)}€</div><div className="text-sm text-gray-500 font-medium mt-1">Estimation / mois</div></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Abonné</th>
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Montant</th>
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Fin engagement</th>
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
          </tr></thead>
          <tbody>
            {(abonnements ?? []).map((a: Record<string, unknown>) => (
              <tr key={a.id as string} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3.5"><div className="font-semibold">{a.client_prenom as string} {a.client_nom as string}</div><div className="text-xs text-gray-400 font-medium">{a.client_email as string}</div></td>
                <td className="px-5 py-3.5 font-semibold">{((a.montant_semaine as number) / 100).toFixed(0)}€/sem {a.est_adherent ? <span className="text-xs text-brand font-medium ml-1">adhérent</span> : null}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500 font-medium">{new Date(a.fin_engagement as string).toLocaleDateString('fr-FR')}</td>
                <td className="px-5 py-3.5"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${a.statut === 'active' ? 'bg-green-100 text-green-700' : a.statut === 'paused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{a.statut === 'active' ? 'Actif' : a.statut === 'paused' ? 'Pausé' : 'Résilié'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!abonnements || abonnements.length === 0) && <div className="text-center py-10 text-sm text-gray-400 font-medium">Aucun abonnement</div>}
      </div>
    </div>
  )
}
