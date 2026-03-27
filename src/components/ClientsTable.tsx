'use client'

import { useState, useMemo } from 'react'

interface Client {
  email: string
  nom: string
  prenom: string
  tel: string | null
  nbConfirmed: number
  nbCancelled: number
  dernierDate: string | null
  premierDate: string | null
}

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'nom' | 'seances' | 'annulations' | 'dernier'>('seances')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clients
      .filter(c =>
        c.nom.toLowerCase().includes(q) ||
        c.prenom.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.tel ?? '').includes(q)
      )
      .sort((a, b) => {
        let va: string | number = 0, vb: string | number = 0
        if (sortBy === 'nom') { va = `${a.nom} ${a.prenom}`; vb = `${b.nom} ${b.prenom}` }
        else if (sortBy === 'seances') { va = a.nbConfirmed; vb = b.nbConfirmed }
        else if (sortBy === 'annulations') { va = a.nbCancelled; vb = b.nbCancelled }
        else if (sortBy === 'dernier') { va = a.dernierDate ?? ''; vb = b.dernierDate ?? '' }
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [clients, search, sortBy, sortDir])

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  function exportCSV() {
    const header = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Séances', 'Annulations', 'Taux annulation', 'Première séance', 'Dernière séance']
    const rows = filtered.map(c => {
      const total = c.nbConfirmed + c.nbCancelled
      const tx = total > 0 ? Math.round((c.nbCancelled / total) * 100) + '%' : '0%'
      return [
        c.prenom, c.nom, c.email, c.tel ?? '',
        c.nbConfirmed, c.nbCancelled, tx,
        c.premierDate ? new Date(c.premierDate + 'T00:00:00').toLocaleDateString('fr-FR') : '',
        c.dernierDate ? new Date(c.dernierDate + 'T00:00:00').toLocaleDateString('fr-FR') : '',
      ]
    })
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `avifit-clients-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className="ml-1 text-gray-300">
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  const fmtDate = (d: string | null) => d
    ? new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
    : '—'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-gray-100">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email, téléphone…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
        />
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
          ⬇ Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('nom')}>
                Client <SortIcon col="nom" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 hidden sm:table-cell">Contact</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-900" onClick={() => toggleSort('seances')}>
                Séances <SortIcon col="seances" />
              </th>
              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-900 hidden md:table-cell" onClick={() => toggleSort('annulations')}>
                Annulations <SortIcon col="annulations" />
              </th>
              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-900 hidden lg:table-cell" onClick={() => toggleSort('dernier')}>
                Dernière séance <SortIcon col="dernier" />
              </th>
              <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 hidden lg:table-cell">Fidélité</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">Aucun résultat</td></tr>
            ) : filtered.map(c => {
              const total = c.nbConfirmed + c.nbCancelled
              const tx = total > 0 ? Math.round((c.nbCancelled / total) * 100) : 0
              const fidelite = c.nbConfirmed >= 10 ? '🏅 Fidèle' : c.nbConfirmed >= 5 ? '⭐ Régulier' : c.nbConfirmed >= 2 ? '👋 Habitué' : '🆕 Nouveau'

              return (
                <tr key={c.email} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{c.prenom} {c.nom}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[180px]">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {c.tel
                      ? <a href={`tel:${c.tel}`} className="text-xs font-medium text-brand hover:underline">📞 {c.tel}</a>
                      : <span className="text-xs text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-black text-brand">{c.nbConfirmed}</span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <div className="text-sm font-semibold text-gray-600">{c.nbCancelled}</div>
                    {tx > 0 && (
                      <div className={`text-xs font-bold ${tx >= 30 ? 'text-red-500' : tx >= 15 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {tx}%
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <div className="text-xs font-medium text-gray-600">{fmtDate(c.dernierDate)}</div>
                    {c.premierDate && c.dernierDate && c.premierDate !== c.dernierDate && (
                      <div className="text-xs text-gray-300">depuis {fmtDate(c.premierDate)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className="text-xs font-semibold">{fidelite}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
