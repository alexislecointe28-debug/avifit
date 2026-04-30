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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata ?? {}

    // ─── SAISON AVIFIT (paiement unique) ──────────────────────
    if (meta.type === 'saison_avifit') {
      await supabase.from('abonnements').insert({
        client_email: meta.client_email,
        client_nom: meta.client_nom,
        client_prenom: meta.client_prenom,
        stripe_payment_id: session.payment_intent as string,
        stripe_customer_id: session.customer as string ?? null,
        statut: 'active',
        est_adherent: meta.estAdherent === 'true',
        avec_licence_ffa: true, // toujours incluse dans les saisons
        montant_semaine: parseInt(meta.montant),
        type_abonnement: meta.type_abonnement,
        debut_le: new Date().toISOString().split('T')[0],
        fin_engagement: '2026-06-30',
      })

      if (session.customer_email) {
        await sendConfirmationAbonnement({
          to: session.customer_email,
          prenom: meta.client_prenom ?? '',
          montantSemaine: parseInt(meta.montant),
          avecLicence: true,
        }).catch(console.error)
      }

      return NextResponse.json({ received: true })
    }

    // ─── COACH PRO ────────────────────────────────────────────
    if (meta.type === 'coach_pro') {
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
        achete_le: new Date().toISOString().split('T')[0],
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

    // ─── SÉANCE CLASSIQUE ─────────────────────────────────────
    if (session.mode === 'payment') {
      await supabase.from('reservations')
        .update({ statut: 'confirmed', stripe_payment_id: session.payment_intent as string })
        .eq('stripe_session_id', session.id)
    }
  }

  return NextResponse.json({ received: true })
}
