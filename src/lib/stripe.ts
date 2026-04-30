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
  // Passes saison — paiement unique, licence FFA toujours incluse
  saison_1x: {
    amount: 28000,      // 280€
    adherent: 18000,    // 180€
    label: 'Saison Avifit 1×/semaine',
    finSaison: '2026-06-30',
  },
  saison_illimitee: {
    amount: 39900,      // 399€
    adherent: 24900,    // 249€
    label: 'Saison Avifit illimitée',
    finSaison: '2026-06-30',
  },
  licence_ffa: {
    amount: 4500,       // 45€
    label: 'Licence FFA annuelle',
  },
} as const

export type SaisonKey = 'saison_1x' | 'saison_illimitee'
