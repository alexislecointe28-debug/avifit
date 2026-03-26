'use client'

import { useState } from 'react'

interface Adherent {
  id: string
  email: string
  nom: string | null
  prenom: string | null
  created_at: string
}

interface Props {
  initialAdherents: Adherent[]
}

export default function AdherentManager({ initialAdherents }: Props) {
  const [adherents, setAdherents] = useState<Adherent[]>(initialAdherents)
  const [email, setEmail] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [showBulk, setShowBulk] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const filtered = adherents.filter(a =>
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.nom ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.prenom ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/adherents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), nom, prenom }),
    })
    const data = await res.json()
    if (res.ok) {
      setAdherents(prev => [...prev, data].sort((a, b) => (a.nom ?? '').localeCompare(b.nom ?? '')))
      setEmail(''); setNom(''); setPrenom('')
    } else {
      setError(data.error ?? 'Erreur')
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet adhérent ?')) return
    const res = await fetch(`/api/admin/adherents/${id}`, { method: 'DELETE' })
    if (res.ok) setAdherents(prev => prev.filter(a => a.id !== id))
  }

  async function handleBulkImport() {
    setBulkLoading(true)
    setError('')
    const emails = bulkText
      .split(/[\n,;]/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes('@'))

    const res = await fetch('/api/admin/adherents/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    })
    const data = await res.json()
    if (res.ok) {
      setBulkText('')
      setShowBulk(false)
      // Rafraîchir la liste
      const res2 = await fetch('/api/admin/adherents')
      const list = await res2.json()
      setAdherents(list)
    } else {
      setError(data.error ?? 'Erreur import')
    }
    setBulkLoading(false)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Ajouter un adhérent */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold mb-4">Ajouter un adhérent</h2>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Prénom</label>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="Marie" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nom</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Email *</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="marie@exemple.fr" />
          </div>
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60">
              {loading ? 'Ajout…' : 'Ajouter'}
            </button>
            <button type="button" onClick={() => setShowBulk(!showBulk)}
              className="border border-gray-200 text-gray-600 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Import en masse
            </button>
          </div>
        </form>

        {/* Import en masse */}
        {showBulk && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Colle les emails ici (séparés par virgule, point-virgule ou retour à la ligne)
            </label>
            <textarea
              rows={4}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none font-mono"
              placeholder={"marie@exemple.fr\njean@exemple.fr, paul@exemple.fr"}
            />
            <button onClick={handleBulkImport} disabled={bulkLoading || !bulkText.trim()}
              className="mt-2 bg-brand text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60">
              {bulkLoading ? 'Import…' : `Importer (${bulkText.split(/[\n,;]/).filter(e => e.trim().includes('@')).length} emails)`}
            </button>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Adhérent</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold">
                  {a.prenom || a.nom ? `${a.prenom ?? ''} ${a.nom ?? ''}`.trim() : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-5 py-3 text-gray-600 font-medium">{a.email}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(a.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-400 font-medium">
            {search ? 'Aucun résultat' : 'Aucun adhérent — ajoutez le premier ci-dessus'}
          </div>
        )}
      </div>
    </div>
  )
}
