import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICES } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { seanceId, nom, prenom, email, format, avecLicenceFfa } = body

    if (!seanceId || !nom || !prenom || !email || !format) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const emailClean = email.toLowerCase().trim()

    // Vérifier la séance
    const { data: seance, error: seanceError } = await supabase
      .from('seances').select('*').eq('id', seanceId).single()
    if (seanceError || !seance) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

    const dispo = seance.places_max - seance.places_reservees
    if (seance.statut === 'complet' || dispo <= 0) return NextResponse.json({ error: 'Cette séance est complète' }, { status: 409 })

    // Bloquer si la séance commence dans moins d'1h
    const debutSeance = new Date(`${seance.date}T${seance.heure_debut}`)
    const cutoff = new Date(Date.now() + 60 * 60 * 1000)
    if (debutSeance <= cutoff) return NextResponse.json({ error: 'Les inscriptions sont closes 1h avant la séance' }, { status: 409 })

    // Vérifier adhérent côté serveur
    const { data: adherentData } = await supabase
      .from('adherents').select('id').eq('email', emailClean).single()
    const estAdherent = !!adherentData

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Vérifier pass mensuel actif → réservation gratuite illimitée
    const { data: aboActif } = await supabase
      .from('abonnements')
      .select('id')
      .eq('client_email', emailClean)
      .eq('statut', 'active')
      .limit(1)
      .single()

    // ─── SÉANCE UNIQUE ───────────────────────────────────────────
    if (format === 'seance') {
      // Si pass mensuel actif → réservation gratuite, pas de décrément
      if (aboActif) {
        const { error: resaError } = await supabase.from('reservations').insert({
          seance_id: seanceId,
          client_nom: nom,
          client_prenom: prenom,
          client_email: emailClean,
          montant_total: 0,
          avec_licence_ffa: avecLicenceFfa ?? false,
          statut: 'confirmed',
          source: 'abonnement',
        })
        if (resaError) return NextResponse.json({ error: resaError.message }, { status: 500 })

        await supabase.from('seances').update({ places_reservees: seance.places_reservees + 1 }).eq('id', seanceId)

        return NextResponse.json({ url: `${appUrl}/confirmation?type=abonnement_seance` })
      }

      const prixSeance = estAdherent ? PRICES.seance.adherent : PRICES.seance.amount

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
            unit_amount: PRICES.licence_ffa.amount,
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

    // ─── PASS MENSUEL ─────────────────────────────────────────────
    if (format === 'abonnement') {
      const priceId = estAdherent ? PRICES.abonnement.priceIdAdherent : PRICES.abonnement.priceId
      const montantMois = estAdherent ? PRICES.abonnement.adherent : PRICES.abonnement.amount

      const customers = await stripe.customers.list({ email, limit: 1 })
      let customer = customers.data[0]
      if (!customer) {
        customer = await stripe.customers.create({
          email,
          name: `${prenom} ${nom}`,
          metadata: { estAdherent: String(estAdherent) },
        })
      }

      type SubLineItem = { price: string; quantity: number }
      type OneTimeItem = { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }
      const lineItems: (SubLineItem | OneTimeItem)[] = [{ price: priceId, quantity: 1 }]

      if (avecLicenceFfa) {
        lineItems.push({
          price_data: { currency: 'eur', product_data: { name: 'Licence FFA annuelle' }, unit_amount: PRICES.licence_ffa.amount },
          quantity: 1,
        })
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: customer.id,
        line_items: lineItems,
        mode: 'subscription',
        subscription_data: {
          metadata: {
            seance_id: seanceId,
            client_nom: nom,
            client_prenom: prenom,
            client_email: emailClean,
            estAdherent: String(estAdherent),
            avec_licence_ffa: String(avecLicenceFfa),
            montant_mois: String(montantMois),
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
