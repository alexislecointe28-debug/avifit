import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export const PRICES = {
  seance: {
    amount: 1000, // 10€ en centimes
    label: 'Séance Avifit',
    description: '1 séance Avifit 1h — Union Nautique de Lyon',
  },
  forfait: {
    amount: 8000, // 80€
    label: 'Forfait 10 séances',
    description: '10 séances Avifit — Union Nautique de Lyon (valable 3 mois)',
  },
  licence_ffa: {
    amount: 4500, // 45€
    label: 'Licence FFA',
    description: 'Licence FFA annuelle — obligatoire si non-licencié',
  },
} as const

export type PriceKey = keyof typeof PRICES
