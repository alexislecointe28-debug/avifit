import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email } = await req.json()
    if (!nom || !prenom || !email) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

    const supabase = createServiceClient()

    // Vérifier pass actif existant
    const { data: existingPass } = await supabase
      .from('pass_seances')
      .select('id')
      .eq('client_email', email.toLowerCase().trim())
      .eq('statut', 'actif')
      .gte('expire_le', new Date().toISOString().split('T')[0])
      .single()

    if (existingPass) {
      return NextResponse.json({ error: 'Vous avez déjà un pass actif.' }, { status: 409 })
    }

    // Vérifier adhérent
    const { data: adherentData } = await supabase
      .from('adherents').select('id').eq('email', email.toLowerCase().trim()).single()
    const estAdherent = !!adherentData
    const prix = estAdherent ? 2500 : 4900

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: estAdherent ? 'Pass 6 séances Avifit — Adhérent AUNL' : 'Pass 6 séances Avifit',
            description: '6 séances · Valable 30 jours · Paiement unique',
          },
          unit_amount: prix,
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: {
        metadata: {
          type: 'pass_seances',
          client_nom: nom,
          client_prenom: prenom,
          client_email: email.toLowerCase().trim(),
          est_adherent: String(estAdherent),
          nb_seances: '6',
        },
      },
      metadata: {
        type: 'pass_seances',
        client_nom: nom,
        client_prenom: prenom,
        client_email: email.toLowerCase().trim(),
        est_adherent: String(estAdherent),
        nb_seances: '6',
      },
      customer_email: email,
      success_url: `${appUrl}/confirmation?type=pass`,
      cancel_url: `${appUrl}/abonnement`,
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout pass error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
