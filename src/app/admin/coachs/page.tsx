import { createServiceClient } from '@/lib/supabase'
import CoachManager from '@/components/CoachManager'

export const dynamic = 'force-dynamic'

export default async function AdminCoachsPage() {
  const supabase = createServiceClient()
  const { data: coachs } = await supabase.from('coachs').select('*').order('prenom')
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Coachs</h1>
        <p className="text-sm text-gray-500 font-medium">Gérez les coachs et leurs règles financières</p>
      </div>
      <CoachManager initialCoachs={coachs ?? []} />
    </div>
  )
}
