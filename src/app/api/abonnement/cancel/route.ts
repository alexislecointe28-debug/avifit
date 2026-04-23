import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: abo } = await supabase
    .from('abonnements')
    .select('*')
    .eq('client_email', email.toLowerCase().trim())
    .eq('statut', 'active')
    .single()

  if (!abo) return NextResponse.json({ error: 'Aucun pass mensuel actif trouvé pour cet email' }, { status: 404 })

  // Pass mensuel sans engagement — résiliation effective à la fin de la période en cours
  await stripe.subscriptions.update(abo.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  await supabase.from('abonnements').update({ statut: 'cancelled' }).eq('id', abo.id)

  return NextResponse.json({
    message: "Votre pass mensuel a bien été résilié. Il reste actif jusqu'à la fin du mois en cours.",
  })
}
