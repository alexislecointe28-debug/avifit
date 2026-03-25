import { createServiceClient } from '@/lib/supabase'
import PromoManager from '@/components/PromoManager'

export const dynamic = 'force-dynamic'

export default async function AdminPromosPage() {
  const supabase = createServiceClient()
  const { data: codes } = await supabase
    .from('codes_promo')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Codes promo</h1>
        <p className="text-sm text-gray-500 font-medium">
          Créez des codes pour offrir des séances d&apos;essai gratuites à vos adhérents.
        </p>
      </div>
      <PromoManager initialCodes={codes ?? []} />
    </div>
  )
}
