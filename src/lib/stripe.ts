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
    // Pass mensuel illimité — prélèvement Stripe récurrent, sans engagement
    priceId: 'price_1TPFUm06PYdTakrbhg1IU4Yi',         // 49€/mois plein tarif
    priceIdAdherent: 'price_1TPFWC06PYdTakrbCOVtQi0n', // 29€/mois adhérent AUNL
    amount: 4900,        // 49€/mois
    adherent: 2900,      // 29€/mois
    label: 'Pass mensuel Avifit',
  },
  licence_ffa: {
    amount: 4500,       // 45€
    label: 'Licence FFA annuelle',
  },
} as const
