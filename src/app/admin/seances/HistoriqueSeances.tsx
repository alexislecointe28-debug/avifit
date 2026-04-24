'use client'

import { useState } from 'react'
import Link from 'next/link'

type Seance = {
  id: string
  date: string
  heure_debut: string
  heure_fin: string
  titre: string
  places_max: number
  places_reservees: number
  statut: string
}

export default function HistoriqueSeances({ seances }: { seances: Seance[] }) {
  const [open, setOpen] = useState(false)

  // Stats rapides
  const totalInscrits = seances.reduce((sum, s) => sum + s.places_reservees, 0)
  const tauxRemplissage = Math.round(totalInscrits / seances.reduce((sum, s) => sum + s.places_max, 0) * 100)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-700">Historique</span>
          <span className="text-xs text-gray-400">{seances.length} séances · {totalInscrits} inscrits total · {tauxRemplissage}% remplissage</span>
        </div>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="flex flex-col gap-1.5 p-3 bg-white">
          {seances.map(s => {
            const date = new Date(s.date + 'T00:00:00')
            const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
            const taux = Math.round(s.places_reservees / s.places_max * 100)
            return (
              <div key={s.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm capitalize text-gray-500">{dateStr}</span>
                    <span className="text-gray-300 text-xs">{s.heure_debut.slice(0,5)}–{s.heure_fin.slice(0,5)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{s.titre}</span>
                    <span className="text-xs text-gray-400">{s.places_reservees}/{s.places_max} inscrits</span>
                    <span className={`text-xs font-semibold ${taux === 100 ? 'text-green-600' : taux >= 70 ? 'text-yellow-600' : 'text-gray-400'}`}>
                      {taux}%
                    </span>
                  </div>
                </div>
                {s.statut === 'annule' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium shrink-0">Annulé</span>
                )}
                <Link href={`/admin/seances/${s.id}`}
                  className="shrink-0 text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                  Voir
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
