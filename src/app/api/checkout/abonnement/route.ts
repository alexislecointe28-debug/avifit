import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, avecLicenceFfa } = await req.json()

    if (!nom || !prenom || !email) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Vérifier si déjà abonné
    const { data: existingAbo } = await supabase
      .from('abonnements')
      .select('id')
      .eq('client_email', email.toLowerCase().trim())
      .eq('statut', 'active')
      .single()

    if (existingAbo) {
      return NextResponse.json({ error: 'Vous avez déjà un abonnement actif.' }, { status: 409 })
    }

    // Vérifier adhérent
    const { data: adherentData } = await supabase
      .from('adherents').select('id').eq('email', email.toLowerCase().trim()).single()
    const estAdherent = !!adherentData

    const prixSemaine = estAdherent ? 400 : 800
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

    // Créer le prix récurrent hebdomadaire
    const price = await stripe.prices.create({
      unit_amount: prixSemaine,
      currency: 'eur',
      recurring: { interval: 'week', interval_count: 1 },
      product_data: {
        name: estAdherent ? 'Abonnement mercredi Avifit — Adhérent AUNL' : 'Abonnement mercredi Avifit',
      },
    })

    type LineItem = { price: string; quantity: number } | { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }
    const lineItems: LineItem[] = [{ price: price.id, quantity: 1 }]

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
        metadata: {
          client_nom: nom,
          client_prenom: prenom,
          client_email: email,
          estAdherent: String(estAdherent),
          avec_licence_ffa: String(avecLicenceFfa),
          montant_semaine: String(prixSemaine),
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
