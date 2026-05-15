import { createServiceClient } from '@/lib/supabase'
import AdminCoachSlotsClient from './AdminCoachSlotsClient'

export const dynamic = 'force-dynamic'

export default async function AdminCoachSlotsPage() {
  const supabase = createServiceClient()

  // Réservations à venir
  const today = new Date().toISOString().split('T')[0]
  const { data: resas } = await supabase
    .from('coach_reservations')
    .select('*, coach_slots(date, heure_debut, heure_fin)')
    .eq('statut', 'confirmed')
    .gte('coach_slots.date', today)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Créneaux Coachs Pro</h1>
        <p className="text-sm text-gray-500">Gérez les disponibilités et visualisez les réservations</p>
      </div>
      <AdminCoachSlotsClient reservations={resas ?? []} />
    </div>
  )
}
