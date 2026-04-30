import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: abo } = await supabase
    .from('abonnements')
    .select('*')
    .eq('client_email', email.toLowerCase().trim())
    .eq('statut', 'active')
    .gte('fin_engagement', today)
    .single()

  if (!abo) return NextResponse.json({ error: 'Aucun pass de saison actif trouvé pour cet email' }, { status: 404 })

  // Saison = paiement unique, pas de résiliation Stripe automatique
  // On marque l'abo comme annulé en DB uniquement
  await supabase.from('abonnements').update({ statut: 'cancelled' }).eq('id', abo.id)

  return NextResponse.json({
    message: 'Votre pass de saison a bien été annulé. Aucun prélèvement supplémentaire ne sera effectué. Contactez-nous pour un remboursement prorata si besoin.',
  })
}
