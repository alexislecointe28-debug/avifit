'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TarifsSection() {
  const [adherent, setAdherent] = useState(false)

  const seance = adherent ? 5 : 10
  const pass = adherent ? 29 : 49

  return (
    <section id="tarifs" className="bg-white border-b border-gray-200 py-10 md:py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Tarifs</p>
        <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">Simple et transparent</h2>

        {/* Toggle adhérent */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 rounded-2xl p-1.5 flex gap-1">
            <button
              onClick={() => setAdherent(false)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${!adherent ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Grand public
            </button>
            <button
              onClick={() => setAdherent(true)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${adherent ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🏅 Adhérent AUNL
            </button>
          </div>
        </div>

        {adherent && (
          <p className="text-center text-xs text-brand font-semibold mb-6 bg-brand-50 border border-brand-100 rounded-xl py-2.5 px-4 max-w-sm mx-auto">
            Tarif réduit — licence FFA déjà incluse dans votre adhésion
          </p>
        )}

        {/* 2 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">

          {/* Séance unique */}
          <div className="rounded-2xl border border-gray-200 p-7 flex flex-col">
            <div className="text-base font-semibold mb-1">Séance unique</div>
            <div className="text-xs text-gray-400 mb-6">Payez à chaque fois, sans engagement</div>
            <div className="mb-6">
              <span className="text-5xl font-black tracking-tight">{seance}€</span>
              <span className="text-sm text-gray-400 ml-2">/ séance</span>
            </div>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {['1h de séance', 'Réservation en ligne', 'Confirmation email', 'Annulation jusqu\'à 24h avant'].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                  <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/planning"
              className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors border border-brand text-brand hover:bg-brand-50">
              Voir les créneaux
            </Link>
          </div>

          {/* Pass mensuel illimité */}
          <div className="rounded-2xl border-2 border-brand p-7 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">Meilleure offre</span>
            </div>
            <div className="text-base font-semibold mb-1">Pass mensuel illimité</div>
            <div className="text-xs text-gray-400 mb-6">Accès à toutes les séances du mois</div>
            <div className="mb-6">
              <span className="text-5xl font-black tracking-tight text-brand">{pass}€</span>
              <span className="text-sm text-gray-400 ml-2">/ mois</span>
            </div>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {[
                'Accès illimité à toutes les séances',
                'Inscription à chaque séance (vous gardez le contrôle)',
                `${pass}€ prélevés chaque mois`,
                'Sans engagement · résiliable à tout moment',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                  <span className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/abonnement"
              className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors bg-brand text-white hover:bg-brand-700">
              Souscrire
            </Link>
          </div>

        </div>

        {/* Note licence FFA discrète */}
        {!adherent && (
          <p className="text-xs text-gray-400 text-center mt-6">
            Pas encore licencié FFA ? +45€ ajoutés automatiquement lors de la réservation.
          </p>
        )}

      </div>
    </section>
  )
}
