import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICES } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, avecLicenceFfa } = await req.json()

    if (!nom || !prenom || !email) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const emailClean = email.toLowerCase().trim()

    // Vérifier si déjà abonné actif
    const { data: existingAbo } = await supabase
      .from('abonnements')
      .select('id')
      .eq('client_email', emailClean)
      .eq('statut', 'active')
      .single()

    if (existingAbo) {
      return NextResponse.json({ error: 'Vous avez déjà un pass mensuel actif.' }, { status: 409 })
    }

    // Vérifier adhérent
    const { data: adherentData } = await supabase
      .from('adherents').select('id').eq('email', emailClean).single()
    const estAdherent = !!adherentData

    const priceId = estAdherent ? PRICES.abonnement.priceIdAdherent : PRICES.abonnement.priceId
    const montantMois = estAdherent ? PRICES.abonnement.adherent : PRICES.abonnement.amount
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

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

    // Line items : abonnement récurrent + éventuelle licence one-shot
    const lineItems: { price?: string; price_data?: object; quantity: number }[] = [
      { price: priceId, quantity: 1 },
    ]

    if (avecLicenceFfa) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Licence FFA annuelle (une seule fois)' },
          unit_amount: PRICES.licence_ffa.amount,
          // Pas de "recurring" → ajouté uniquement sur la 1ère facture
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customer.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      line_items: lineItems as any,
      mode: 'subscription',
      subscription_data: {
        metadata: {
          client_nom: nom,
          client_prenom: prenom,
          client_email: emailClean,
          estAdherent: String(estAdherent),
          avec_licence_ffa: String(avecLicenceFfa),
          montant_mois: String(montantMois),
        },
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
