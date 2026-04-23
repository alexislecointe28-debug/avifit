import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { sendConfirmationAbonnement, sendConfirmationCoachPro } from '@/lib/emails'
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

  // ─── CHECKOUT COMPLETED ───────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Paiement unique (séance ou coach pro)
    if (session.mode === 'payment') {
      const meta = session.metadata ?? {}

      // ─── COACH PRO : créer crédit heures ──────────────────────
      if (meta.type === 'coach_pro') {
        const debut = new Date()
        const expire = new Date()
        expire.setDate(expire.getDate() + 30)

        await supabase.from('coach_credits').insert({
          coach_email: meta.coach_email,
          coach_nom: meta.coach_nom,
          coach_prenom: meta.coach_prenom,
          coach_tel: meta.coach_tel,
          coach_structure: meta.coach_structure,
          type_achat: meta.type_pack,
          nb_heures_total: parseInt(meta.nb_heures),
          nb_heures_restantes: parseInt(meta.nb_heures),
          montant: parseInt(meta.montant),
          statut: 'actif',
          stripe_payment_id: session.payment_intent as string,
          achete_le: debut.toISOString().split('T')[0],
          expire_le: expire.toISOString().split('T')[0],
        })

        if (meta.coach_email) {
          await sendConfirmationCoachPro({
            to: meta.coach_email,
            prenom: meta.coach_prenom ?? '',
            typeAchat: meta.type_pack as 'seance' | 'pack_10' | 'pack_20',
            nbHeures: parseInt(meta.nb_heures),
            montant: parseInt(meta.montant),
            expireLe: expire.toISOString().split('T')[0],
          }).catch(console.error)
        }
        return NextResponse.json({ received: true })
      }

      // ─── SÉANCE CLASSIQUE : confirmer réservation ─────────────
      await supabase.from('reservations')
        .update({ statut: 'confirmed', stripe_payment_id: session.payment_intent as string })
        .eq('stripe_session_id', session.id)
    }

    // Abonnement mensuel (pass illimité) → créer l'abo en DB + éventuelle 1ère réservation
    if (session.mode === 'subscription') {
      const sub = session.subscription as string
      const stripeSubscription = await stripe.subscriptions.retrieve(sub)
      const meta = stripeSubscription.metadata ?? {}

      const debut = new Date()
      // Sans engagement → fin_engagement = debut (résiliation possible immédiatement)
      const finEngagement = new Date()

      // Email de confirmation abonnement
      if (session.customer_email) {
        await sendConfirmationAbonnement({
          to: session.customer_email,
          prenom: meta.client_prenom ?? '',
          montantSemaine: parseInt(meta.montant_mois ?? '4900'),
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
        // La colonne s'appelle encore montant_semaine en DB mais stocke le montant mensuel en centimes
        montant_semaine: parseInt(meta.montant_mois ?? '4900'),
        debut_le: debut.toISOString().split('T')[0],
        fin_engagement: finEngagement.toISOString().split('T')[0],
      })

      // Si l'abonnement a été souscrit depuis une page de réservation (seance_id présent),
      // on inscrit l'utilisateur à cette séance immédiatement (gratuitement)
      if (meta.seance_id) {
        const { data: seance } = await supabase
          .from('seances').select('places_max, places_reservees, statut').eq('id', meta.seance_id).single()
        if (seance && seance.statut !== 'annule' && seance.places_reservees < seance.places_max) {
          await supabase.from('reservations').insert({
            seance_id: meta.seance_id,
            client_email: meta.client_email,
            client_nom: meta.client_nom,
            client_prenom: meta.client_prenom,
            statut: 'confirmed',
            stripe_payment_id: sub,
            avec_licence_ffa: meta.avec_licence_ffa === 'true',
            montant_total: 0,
            source: 'abonnement',
          })
          await supabase.from('seances')
            .update({ places_reservees: seance.places_reservees + 1 })
            .eq('id', meta.seance_id)
        }
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
