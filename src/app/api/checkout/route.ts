import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { seanceId, nom, prenom, email, format, avecLicenceFfa } = body

    if (!seanceId || !nom || !prenom || !email || !format) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Vérifier la séance
    const { data: seance, error: seanceError } = await supabase
      .from('seances').select('*').eq('id', seanceId).single()
    if (seanceError || !seance) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

    const dispo = seance.places_max - seance.places_reservees
    if (seance.statut === 'complet' || dispo <= 0) return NextResponse.json({ error: 'Cette séance est complète' }, { status: 409 })

    // Vérifier adhérent côté serveur
    const { data: adherentData } = await supabase
      .from('adherents').select('id').eq('email', email.toLowerCase().trim()).single()
    const estAdherent = !!adherentData

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // ─── SÉANCE UNIQUE ───────────────────────────────────────────
    if (format === 'seance') {
      const prixSeance = estAdherent ? 500 : 1000

      type LineItem = {
        price_data: { currency: string; product_data: { name: string; description?: string }; unit_amount: number }
        quantity: number
      }
      const lineItems: LineItem[] = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: estAdherent ? 'Séance Avifit — Tarif adhérent AUNL' : 'Séance Avifit',
            description: `${seance.titre} — ${seance.date}`,
          },
          unit_amount: prixSeance,
        },
        quantity: 1,
      }]

      if (avecLicenceFfa) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: { name: 'Licence FFA annuelle' },
            unit_amount: 4500,
          },
          quantity: 1,
        })
      }

      const montantTotal = lineItems.reduce((sum, i) => sum + i.price_data.unit_amount, 0)

      const { data: reservation } = await supabase.from('reservations')
        .insert({ seance_id: seanceId, client_email: email, client_nom: nom, client_prenom: prenom, statut: 'pending', avec_licence_ffa: avecLicenceFfa, montant_total: montantTotal })
        .select().single()

      if (!reservation) return NextResponse.json({ error: 'Erreur création réservation' }, { status: 500 })

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: email,
        metadata: { reservation_id: reservation.id, seance_id: seanceId, format: 'seance', client_nom: nom, client_prenom: prenom },
        success_url: `${appUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/reserver/${seanceId}?cancelled=1`,
        locale: 'fr',
      })

      await supabase.from('reservations').update({ stripe_session_id: session.id }).eq('id', reservation.id)
      return NextResponse.json({ url: session.url })
    }

    // ─── ABONNEMENT MERCREDI ─────────────────────────────────────
    if (format === 'abonnement') {
      const prixSemaine = estAdherent ? 400 : 800

      // Créer ou récupérer le customer Stripe
      const customers = await stripe.customers.list({ email, limit: 1 })
      let customer = customers.data[0]
      if (!customer) {
        customer = await stripe.customers.create({
          email,
          name: `${prenom} ${nom}`,
          metadata: { estAdherent: String(estAdherent) },
        })
      }

      // Créer le prix récurrent Stripe (hebdomadaire)
      const price = await stripe.prices.create({
        unit_amount: prixSemaine,
        currency: 'eur',
        recurring: { interval: 'week', interval_count: 1 },
        product_data: {
          name: estAdherent ? 'Abonnement mercredi Avifit — Tarif adhérent AUNL' : 'Abonnement mercredi Avifit',
        },
      })

      // Line items pour le checkout — abonnement + éventuelle licence one-shot
      type SubLineItem = { price: string; quantity: number }
      type OneTimeItem = { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }

      const lineItems: (SubLineItem | OneTimeItem)[] = [{ price: price.id, quantity: 1 }]

      if (avecLicenceFfa) {
        lineItems.push({
          price_data: { currency: 'eur', product_data: { name: 'Licence FFA annuelle' }, unit_amount: 4500 },
          quantity: 1,
        })
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: customer.id,
        line_items: lineItems,
        mode: 'subscription',
        subscription_data: {
          trial_period_days: undefined,
          metadata: {
            seance_id: seanceId,
            client_nom: nom,
            client_prenom: prenom,
            client_email: email,
            estAdherent: String(estAdherent),
            avec_licence_ffa: String(avecLicenceFfa),
            montant_semaine: String(prixSemaine),
          },
        },
        success_url: `${appUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}&type=abonnement`,
        cancel_url: `${appUrl}/reserver/${seanceId}?cancelled=1`,
        locale: 'fr',
      })

      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
