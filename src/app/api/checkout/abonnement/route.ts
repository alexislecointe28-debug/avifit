import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICES, SaisonKey } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, typeAbonnement } = await req.json()

    if (!nom || !prenom || !email || !typeAbonnement) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    if (!['saison_1x', 'saison_illimitee'].includes(typeAbonnement)) {
      return NextResponse.json({ error: 'Formule invalide' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const emailClean = email.toLowerCase().trim()

    // Bloquer si saison déjà active
    const today = new Date().toISOString().split('T')[0]
    const { data: existingAbo } = await supabase
      .from('abonnements')
      .select('id')
      .eq('client_email', emailClean)
      .eq('statut', 'active')
      .gte('fin_engagement', today)
      .single()

    if (existingAbo) {
      return NextResponse.json({ error: 'Vous avez déjà un pass de saison actif.' }, { status: 409 })
    }

    const { data: adherentData } = await supabase
      .from('adherents').select('id').eq('email', emailClean).single()
    const estAdherent = !!adherentData

    const priceKey = typeAbonnement as SaisonKey
    const montant = estAdherent ? PRICES[priceKey].adherent : PRICES[priceKey].amount
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: PRICES[priceKey].label + (estAdherent ? ' — Tarif adhérent AUNL' : ''),
            description: `Licence FFA incluse · Valable jusqu'au 30 juin 2026 · Réservation séance par séance`,
          },
          unit_amount: montant,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      metadata: {
        type: 'saison_avifit',
        type_abonnement: typeAbonnement,
        client_nom: nom,
        client_prenom: prenom,
        client_email: emailClean,
        estAdherent: String(estAdherent),
        montant: String(montant),
      },
      success_url: `${appUrl}/confirmation?type=abonnement`,
      cancel_url: `${appUrl}/abonnement`,
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout abonnement error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
