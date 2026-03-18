import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICES } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const { seanceId, format, licenceFFA, nom, prenom, email } = await req.json()

    if (!seanceId || !format || !email || !nom || !prenom) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: seance, error } = await supabase
      .from('seances')
      .select('*')
      .eq('id', seanceId)
      .single()

    if (error || !seance) {
      return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })
    }

    if (seance.statut === 'complet' || seance.places_reservees >= seance.places_max) {
      return NextResponse.json({ error: 'Cette séance est complète' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://avifit.vercel.app'

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    if (format === 'forfait') {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: PRICES.forfait.label, description: PRICES.forfait.description },
          unit_amount: PRICES.forfait.amount,
        },
        quantity: 1,
      })
    } else {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: PRICES.seance.label,
            description: `${seance.titre} — ${seance.date} ${String(seance.heure_debut).slice(0, 5)}`,
          },
          unit_amount: seance.prix as number,
        },
        quantity: 1,
      })
    }

    if (licenceFFA) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: PRICES.licence_ffa.label, description: PRICES.licence_ffa.description },
          unit_amount: PRICES.licence_ffa.amount,
        },
        quantity: 1,
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: lineItems,
      metadata: { seanceId, format, licenceFFA: licenceFFA ? 'true' : 'false', nom, prenom, email },
      success_url: `${appUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/reserver/${seanceId}?cancelled=true`,
      locale: 'fr',
    })

    const montantTotal = lineItems.reduce((sum: number, item: Stripe.Checkout.SessionCreateParams.LineItem) => {
      return sum + ((item.price_data?.unit_amount ?? 0) as number)
    }, 0)

    await supabase.from('reservations').insert({
      seance_id: seanceId,
      client_email: email,
      client_nom: nom,
      client_prenom: prenom,
      statut: 'pending',
      stripe_session_id: session.id,
      avec_licence_ffa: licenceFFA,
      montant_total: montantTotal,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
