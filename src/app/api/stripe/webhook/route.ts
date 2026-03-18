import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const supabase = createServiceClient()

    const { data: reservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('stripe_session_id', session.id)
      .single()

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    await supabase
      .from('reservations')
      .update({ statut: 'confirmed', stripe_payment_id: session.payment_intent as string })
      .eq('stripe_session_id', session.id)

    if (session.metadata?.format === 'forfait') {
      await supabase.from('achats_forfait').insert({
        client_email: reservation.client_email,
        client_nom: reservation.client_nom,
        client_prenom: reservation.client_prenom,
        seances_restantes: 10,
        stripe_payment_id: session.payment_intent as string,
      })
    }
  }

  return NextResponse.json({ received: true })
}
