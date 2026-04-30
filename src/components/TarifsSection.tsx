'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function TarifsSection() {
  const [adherent, setAdherent] = useState(false)

  const seance = adherent ? 5 : 10
  const saison1x = adherent ? 180 : 280
  const saisonIllimitee = adherent ? 249 : 399

  return (
    <section id="tarifs" className="bg-white border-b border-gray-200 py-10 md:py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Tarifs</p>
        <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-tight">Simple et transparent</h2>

        {/* Toggle adhérent */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 rounded-2xl p-1.5 flex gap-1">
            <button onClick={() => setAdherent(false)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${!adherent ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Grand public
            </button>
            <button onClick={() => setAdherent(true)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${adherent ? 'bg-white text-brand shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              🏅 Adhérent AUNL
            </button>
          </div>
        </div>

        {adherent && (
          <p className="text-center text-xs text-brand font-semibold mb-6 bg-brand-50 border border-brand-100 rounded-xl py-2.5 px-4 max-w-sm mx-auto">
            Tarif réduit — licence FFA déjà incluse dans votre adhésion AUNL
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">

          {/* Séance unitaire */}
          <div className="rounded-2xl border border-gray-200 p-6 flex flex-col bg-white">
            <div className="text-sm font-semibold mb-1">Séance unique</div>
            <div className="text-xs text-gray-400 mb-5">Sans engagement</div>
            <div className="mb-5">
              <span className="text-4xl font-black tracking-tight">{seance}€</span>
              <span className="text-sm text-gray-400 ml-1">/ séance</span>
            </div>
            <ul className="flex flex-col gap-2 mb-6 flex-1 text-xs text-gray-600">
              <li className="flex gap-2"><span className="text-green-500">✓</span> 1h encadré par coach FFA</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Réservation en ligne</li>
              {!adherent && <li className="flex gap-2"><span className="text-gray-400">+</span> Licence FFA +45€ si besoin</li>}
            </ul>
            <Link href="/planning"
              className="block text-center py-2.5 rounded-xl text-sm font-semibold border border-brand text-brand hover:bg-brand-50 transition-colors">
              Voir les créneaux
            </Link>
          </div>

          {/* Saison 1x */}
          <div className="rounded-2xl border border-gray-200 p-6 flex flex-col bg-white">
            <div className="text-sm font-semibold mb-1">Saison 1×/semaine</div>
            <div className="text-xs text-gray-400 mb-5">Sept → juin · Licence FFA incluse</div>
            <div className="mb-5">
              <span className="text-4xl font-black tracking-tight">{saison1x}€</span>
              <span className="text-sm text-gray-400 ml-1">/ saison</span>
            </div>
            <ul className="flex flex-col gap-2 mb-6 flex-1 text-xs text-gray-600">
              <li className="flex gap-2"><span className="text-green-500">✓</span> 1 séance par semaine</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Licence FFA incluse</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Inscription séance par séance</li>
            </ul>
            <Link href="/abonnement"
              className="block text-center py-2.5 rounded-xl text-sm font-semibold border border-brand text-brand hover:bg-brand-50 transition-colors">
              Souscrire
            </Link>
          </div>

          {/* Saison illimitée */}
          <div className="rounded-2xl border-2 border-brand p-6 flex flex-col relative bg-white">
            <div className="absolute -top-3 right-4">
              <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">Meilleure offre</span>
            </div>
            <div className="text-sm font-semibold mb-1">Saison illimitée</div>
            <div className="text-xs text-gray-400 mb-5">Sept → juin · Licence FFA incluse</div>
            <div className="mb-5">
              <span className="text-4xl font-black tracking-tight text-brand">{saisonIllimitee}€</span>
              <span className="text-sm text-gray-400 ml-1">/ saison</span>
            </div>
            <ul className="flex flex-col gap-2 mb-6 flex-1 text-xs text-gray-600">
              <li className="flex gap-2"><span className="text-brand">✓</span> Séances illimitées</li>
              <li className="flex gap-2"><span className="text-brand">✓</span> Licence FFA incluse</li>
              <li className="flex gap-2"><span className="text-brand">✓</span> Inscription séance par séance</li>
            </ul>
            <Link href="/abonnement"
              className="block text-center py-2.5 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-700 transition-colors">
              Souscrire
            </Link>
          </div>

        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Licence FFA obligatoire pour pratiquer · Incluse dans les passes saison · +45€ uniquement pour les séances à l&apos;unité si vous n&apos;êtes pas déjà licencié
        </p>
      </div>
    </section>
  )
}
