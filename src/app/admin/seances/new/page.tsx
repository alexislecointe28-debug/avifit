import SeanceForm from '@/components/SeanceForm'
import { createServiceClient } from '@/lib/supabase'

export default async function NewSeancePage() {
  const supabase = createServiceClient()
  const { data: coachsList } = await supabase.from('coachs').select('id, prenom, nom').eq('actif', true).order('prenom')

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Nouvelle séance</h1>
        <p className="text-sm text-gray-500 font-medium">Créer un nouveau créneau Avifit</p>
      </div>
      <SeanceForm mode="create" coachs={coachsList ?? []} />
    </div>
  )
}
