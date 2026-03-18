import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = createServiceClient()

    // Confirmer la réservation
    await supabase
      .from('reservations')
      .update({ statut: 'confirmed', stripe_payment_id: session.payment_intent as string })
      .eq('stripe_session_id', session.id)

    // Si forfait : créer l'achat forfait
    if (session.metadata?.format === 'forfait') {
      await supabase.from('achats_forfait').insert({
        client_email: session.customer_email,
        client_nom: session.metadata.client_nom,
        client_prenom: session.metadata.client_prenom,
        seances_restantes: 10,
        stripe_payment_id: session.payment_intent as string,
      })
    }
  }

  return NextResponse.json({ received: true })
}
