'use client'

import { useState } from 'react'

interface CoachStats {
  prenom: string; nom: string
  gains: number; nbResa: number
  nbExt: number; nbAdh: number; nbFormExt: number; nbFormAdh: number
}

interface Props {
  statsByCoach: Record<string, CoachStats>
  prevTotal: number
  prevCoachs: number
  prevClub: number
  moisLabel: string
}

export default function DashboardFinancier({ statsByCoach, prevTotal, prevCoachs, prevClub, moisLabel }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const fmt = (cents: number) => (cents / 100).toFixed(2) + '€'

  const coachIds = Object.keys(statsByCoach)
  const displayed = selected ? { [selected]: statsByCoach[selected] } : statsByCoach

  return (
    <div className="flex flex-col gap-4">

      {/* Par coach */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold">Répartition par coach</h2>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{moisLabel}</p>
          </div>
          {/* Filtre */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelected(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${!selected ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-500 hover:border-brand hover:text-brand'}`}>
              Tous
            </button>
            {coachIds.map(id => (
              <button key={id} onClick={() => setSelected(id === selected ? null : id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${selected === id ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-500 hover:border-brand hover:text-brand'}`}>
                {statsByCoach[id].prenom}
              </button>
            ))}
          </div>
        </div>

        {coachIds.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucune réservation avec coach attribué ce mois</p>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.entries(displayed).map(([id, s]) => {
              const details = [
                s.nbExt > 0 && `${s.nbExt} séance${s.nbExt > 1 ? 's' : ''} ext.`,
                s.nbAdh > 0 && `${s.nbAdh} séance${s.nbAdh > 1 ? 's' : ''} adh.`,
                s.nbFormExt > 0 && `${s.nbFormExt} formule ext.`,
                s.nbFormAdh > 0 && `${s.nbFormAdh} formule adh.`,
              ].filter(Boolean).join(' · ')

              return (
                <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold">{s.prenom} {s.nom}</span>
                      <span className="text-xs font-semibold bg-brand-50 text-brand px-2 py-0.5 rounded-full">{s.nbResa} résas</span>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">{details || 'Aucune réservation'}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-black text-brand">{fmt(s.gains)}</div>
                    <div className="text-xs text-gray-400">à refacturer</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Prévisionnel */}
      {prevTotal > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold mb-1">Prévisionnel fin de mois</h2>
          <p className="text-xs text-gray-400 mb-4">Réservations déjà confirmées sur séances à venir</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total prévu</div>
              <div className="text-2xl font-black text-gray-900">{fmt(prevTotal)}</div>
            </div>
            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <div className="text-xs font-bold text-brand uppercase tracking-widest mb-1">Coachs prévu</div>
              <div className="text-2xl font-black text-brand">{fmt(prevCoachs)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Club prévu</div>
              <div className="text-2xl font-black text-gray-700">{fmt(prevClub)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
