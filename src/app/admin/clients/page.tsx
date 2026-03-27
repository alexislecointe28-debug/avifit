import { createServiceClient } from '@/lib/supabase'
import ClientsTable from '@/components/ClientsTable'

export const dynamic = 'force-dynamic'

export default async function AdminClientsPage() {
  const supabase = createServiceClient()

  // Toutes les réservations avec stats
  const { data: reservations } = await supabase
    .from('reservations')
    .select('client_email, client_nom, client_prenom, client_tel, statut, created_at, seances(date)')
    .order('created_at', { ascending: false })

  // Agréger par client
  interface ClientStats {
    email: string
    nom: string
    prenom: string
    tel: string | null
    nbConfirmed: number
    nbCancelled: number
    dernierDate: string | null
    premierDate: string | null
  }

  const clientsMap: Record<string, ClientStats> = {}

  for (const r of reservations ?? []) {
    const email = r.client_email
    if (!email || email.includes('@avifit.local')) continue

    if (!clientsMap[email]) {
      clientsMap[email] = {
        email,
        nom: r.client_nom ?? '',
        prenom: r.client_prenom ?? '',
        tel: r.client_tel ?? null,
        nbConfirmed: 0,
        nbCancelled: 0,
        dernierDate: null,
        premierDate: null,
      }
    }

    const seance = r.seances as unknown as { date: string } | null
    const date = seance?.date ?? null

    if (r.statut === 'confirmed') {
      clientsMap[email].nbConfirmed++
      if (date) {
        if (!clientsMap[email].dernierDate || date > clientsMap[email].dernierDate!) clientsMap[email].dernierDate = date
        if (!clientsMap[email].premierDate || date < clientsMap[email].premierDate!) clientsMap[email].premierDate = date
      }
    } else if (r.statut === 'cancelled') {
      clientsMap[email].nbCancelled++
    }

    // Mise à jour nom/tel si manquant
    if (!clientsMap[email].tel && r.client_tel) clientsMap[email].tel = r.client_tel
  }

  const clients = Object.values(clientsMap).sort((a, b) => b.nbConfirmed - a.nbConfirmed)

  const totalSeances = clients.reduce((s, c) => s + c.nbConfirmed, 0)
  const totalAnnulations = clients.reduce((s, c) => s + c.nbCancelled, 0)
  const txAnnulation = totalSeances + totalAnnulations > 0
    ? Math.round((totalAnnulations / (totalSeances + totalAnnulations)) * 100)
    : 0

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Clients</h1>
        <p className="text-sm text-gray-500 font-medium">{clients.length} clients · {totalSeances} séances réalisées · {txAnnulation}% d&apos;annulations</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Clients uniques', value: clients.length, color: 'text-gray-900' },
          { label: 'Séances réalisées', value: totalSeances, color: 'text-brand' },
          { label: 'Annulations', value: totalAnnulations, color: 'text-orange-500' },
          { label: 'Taux annulation', value: `${txAnnulation}%`, color: txAnnulation > 20 ? 'text-red-500' : 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <ClientsTable clients={clients} />
    </div>
  )
}
