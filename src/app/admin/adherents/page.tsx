import { createServiceClient } from '@/lib/supabase'
import AdherentManager from '@/components/AdherentManager'

export const dynamic = 'force-dynamic'

export default async function AdminAdherentsPage() {
  const supabase = createServiceClient()
  const { data: adherents } = await supabase
    .from('adherents')
    .select('*')
    .order('nom', { ascending: true })

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Adhérents AUNL</h1>
        <p className="text-sm text-gray-500 font-medium">
          {adherents?.length ?? 0} adhérent{(adherents?.length ?? 0) > 1 ? 's' : ''} — tarif 5€/séance automatique à la réservation
        </p>
      </div>
      <AdherentManager initialAdherents={adherents ?? []} />
    </div>
  )
}
