import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { seanceId, nom, prenom, email, format, avecLicenceFfa, isAdherent } = body

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

    // Vérifier le statut adhérent côté serveur (sécurité)
    const { data: adherentData } = await supabase
      .from('adherents').select('id').eq('email', email.toLowerCase().trim()).single()
    const adherentVerifie = !!adherentData

    // Prix selon statut réel (pas celui envoyé par le client)
    const prixSeance = adherentVerifie ? 500 : seance.prix   // 5€ ou 10€
    const prixForfait = adherentVerifie ? 4000 : 8000         // 40€ ou 80€

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    type LineItem = {
      price_data: { currency: string; product_data: { name: string; description?: string }; unit_amount: number }
      quantity: number
    }
    const lineItems: LineItem[] = []

    if (format === 'seance') {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: adherentVerifie ? 'Séance Avifit — Tarif adhérent AUNL' : 'Séance Avifit',
            description: `${seance.titre} — ${seance.date}`,
          },
          unit_amount: prixSeance,
        },
        quantity: 1,
      })
    } else {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: adherentVerifie ? 'Forfait 10 séances Avifit — Tarif adhérent AUNL' : 'Forfait 10 séances Avifit',
            description: 'Valable 3 mois',
          },
          unit_amount: prixForfait,
        },
        quantity: 1,
      })
    }

    if (avecLicenceFfa) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Licence FFA annuelle', description: 'Obligatoire si non-licencié' },
          unit_amount: 4500,
        },
        quantity: 1,
      })
    }

    const montantTotal = lineItems.reduce((sum, item) => sum + item.price_data.unit_amount, 0)

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        seance_id: seanceId, client_email: email, client_nom: nom, client_prenom: prenom,
        statut: 'pending', avec_licence_ffa: avecLicenceFfa, montant_total: montantTotal,
      })
      .select().single()

    if (reservationError || !reservation) return NextResponse.json({ error: 'Erreur création réservation' }, { status: 500 })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      metadata: {
        reservation_id: reservation.id, seance_id: seanceId, format,
        client_nom: nom, client_prenom: prenom,
        adherent: adherentVerifie ? 'true' : 'false',
      },
      success_url: `${appUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/reserver/${seanceId}?cancelled=1`,
      locale: 'fr',
    })

    await supabase.from('reservations').update({ stripe_session_id: session.id }).eq('id', reservation.id)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
