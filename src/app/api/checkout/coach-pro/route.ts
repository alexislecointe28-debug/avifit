import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const PACKS = {
  seance: { label: 'Accès salle Avifit — 1h', amount: 2500, heures: 1 },
  pack_10: { label: 'Pack 10h — Coachs Pro Avifit', amount: 20000, heures: 10 },
  pack_20: { label: 'Pack 20h — Coachs Pro Avifit', amount: 36000, heures: 20 },
} as const

type PackKey = keyof typeof PACKS

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, tel, structure, typePack, declareAssure } = await req.json()

    if (!nom || !prenom || !email || !tel || !structure || !typePack || !declareAssure) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
    }

    if (!(typePack in PACKS)) {
      return NextResponse.json({ error: 'Pack invalide' }, { status: 400 })
    }

    const pack = PACKS[typePack as PackKey]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: pack.label,
            description: `${pack.heures}h · Valable 30 jours · AUNL Lyon`,
          },
          unit_amount: pack.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      metadata: {
        type: 'coach_pro',
        type_pack: typePack,
        nb_heures: String(pack.heures),
        montant: String(pack.amount),
        coach_nom: nom,
        coach_prenom: prenom,
        coach_email: email.toLowerCase().trim(),
        coach_tel: tel,
        coach_structure: structure,
      },
      success_url: `${appUrl}/confirmation?type=coach_pro`,
      cancel_url: `${appUrl}/coachs-pro`,
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout coach-pro error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
