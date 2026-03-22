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

  if (!abo) return NextResponse.json({ error: 'Aucun abonnement actif trouvé pour cet email' }, { status: 404 })

  // Vérifier engagement minimum
  const finEngagement = new Date(abo.fin_engagement)
  const today = new Date()

  if (today < finEngagement) {
    const joursRestants = Math.ceil((finEngagement.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return NextResponse.json({
      error: `Engagement minimum non atteint. Résiliation possible dans ${joursRestants} jour(s) (le ${finEngagement.toLocaleDateString('fr-FR')}).`
    }, { status: 400 })
  }

  // Résilier sur Stripe à la fin de la période en cours
  await stripe.subscriptions.update(abo.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  await supabase.from('abonnements').update({ statut: 'cancelled' }).eq('id', abo.id)

  return NextResponse.json({
    message: "Votre abonnement a bien été résilié. Il reste actif jusqu'à la fin de la semaine en cours."
  })
}
