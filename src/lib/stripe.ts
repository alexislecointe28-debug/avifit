import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export const PRICES = {
  seance: {
    amount: 1000,       // 10€
    adherent: 500,      // 5€
    label: 'Séance Avifit',
  },
  abonnement: {
    amount: 800,        // 8€/semaine
    adherent: 400,      // 4€/semaine
    label: 'Formule illimitée Avifit',
    minimum_weeks: 4,   // 1 mois minimum
  },
  licence_ffa: {
    amount: 4500,       // 45€
    label: 'Licence FFA annuelle',
  },
} as const
