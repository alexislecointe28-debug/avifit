import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { sendConfirmationAbonnement } from '@/lib/emails'
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

  const supabase = createServiceClient()

  // ─── PAIEMENT SÉANCE UNIQUE ───────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.mode === 'payment') {
      const meta = session.metadata ?? {}

      if (meta.type === 'pass_seances') {
        // Créer le pass en DB
        const debut = new Date()
        const expire = new Date()
        expire.setDate(expire.getDate() + 30)

        await supabase.from('pass_seances').insert({
          client_email: meta.client_email,
          client_nom: meta.client_nom,
          client_prenom: meta.client_prenom,
          nb_seances_total: 6,
          nb_seances_restantes: 6,
          statut: 'actif',
          est_adherent: meta.est_adherent === 'true',
          stripe_payment_id: session.payment_intent as string,
          achete_le: debut.toISOString().split('T')[0],
          expire_le: expire.toISOString().split('T')[0],
        })
      } else {
        // Confirmer la réservation existante
        await supabase.from('reservations')
          .update({ statut: 'confirmed', stripe_payment_id: session.payment_intent as string })
          .eq('stripe_session_id', session.id)
      }
    }

    if (session.mode === 'subscription') {
      // Créer l'abonnement en DB
      const sub = session.subscription as string
      const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const meta = stripeSubscription.metadata ?? {}

      // Calculer la fin d'engagement (4 semaines)
      const debut = new Date()
      const finEngagement = new Date()
      finEngagement.setDate(finEngagement.getDate() + 28)

      // Email de confirmation abonnement
      if (session.customer_email) {
        await sendConfirmationAbonnement({
          to: session.customer_email,
          prenom: meta.client_prenom ?? '',
          montantSemaine: parseInt(meta.montant_semaine ?? '800'),
          avecLicence: meta.avec_licence_ffa === 'true',
        }).catch(console.error)
      }

      await supabase.from('abonnements').insert({
        client_email: meta.client_email,
        client_nom: meta.client_nom,
        client_prenom: meta.client_prenom,
        stripe_subscription_id: sub,
        stripe_customer_id: session.customer as string,
        statut: 'active',
        est_adherent: meta.estAdherent === 'true',
        avec_licence_ffa: meta.avec_licence_ffa === 'true',
        montant_semaine: parseInt(meta.montant_semaine ?? '800'),
        debut_le: debut.toISOString().split('T')[0],
        fin_engagement: finEngagement.toISOString().split('T')[0],
      })

      // Créer la première réservation (séance actuelle)
      await supabase.from('reservations').insert({
        seance_id: meta.seance_id,
        client_email: meta.client_email,
        client_nom: meta.client_nom,
        client_prenom: meta.client_prenom,
        statut: 'confirmed',
        stripe_payment_id: session.payment_intent as string ?? sub,
        avec_licence_ffa: meta.avec_licence_ffa === 'true',
        montant_total: parseInt(meta.montant_semaine ?? '800'),
      })
    }
  }

  // ─── PRÉLÈVEMENT HEBDOMADAIRE (abonnement récurrent) ──────────
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string; payment_intent?: string }
    if (!invoice.subscription) return NextResponse.json({ received: true })

    // Récupérer l'abonnement en DB
    const { data: abo } = await supabase
      .from('abonnements')
      .select('*')
      .eq('stripe_subscription_id', invoice.subscription as string)
      .single()

    if (!abo || abo.statut !== 'active') return NextResponse.json({ received: true })

    // Trouver la prochaine séance mercredi
    const nextWed = getNextWednesday()
    const { data: seance } = await supabase
      .from('seances')
      .select('*')
      .gte('date', nextWed)
      .neq('statut', 'annule')
      .order('date')
      .limit(1)
      .single()

    if (seance) {
      const dispo = seance.places_max - seance.places_reservees
      if (dispo > 0) {
        await supabase.from('reservations').insert({
          seance_id: seance.id,
          client_email: abo.client_email,
          client_nom: abo.client_nom,
          client_prenom: abo.client_prenom,
          statut: 'confirmed',
          stripe_payment_id: invoice.payment_intent as string,
          avec_licence_ffa: false,
          montant_total: abo.montant_semaine,
        })
      }
    }
  }

  // ─── RÉSILIATION ──────────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('abonnements')
      .update({ statut: 'cancelled' })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}

function getNextWednesday(): string {
  const today = new Date()
  const day = today.getDay()
  const daysUntilWed = (3 - day + 7) % 7 || 7
  const wed = new Date(today)
  wed.setDate(today.getDate() + daysUntilWed)
  return wed.toISOString().split('T')[0]
}
