'use client'

import { useState } from 'react'

interface Code {
  id: string
  code: string
  type: string
  valeur: number
  nb_max: number | null
  nb_utilises: number
  expire_le: string | null
  actif: boolean
  description: string | null
  created_at: string
}

export default function PromoManager({ initialCodes }: { initialCodes: Code[] }) {
  const [codes, setCodes] = useState<Code[]>(initialCodes)
  const [form, setForm] = useState({ code: '', description: '', nb_max: '10', expire_le: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function generateCode() {
    const adjectives = ['ESSAI', 'OFFERT', 'WELCOME', 'BIENVENUE', 'AUNL', 'AVIFIT']
    const suffixes = Math.random().toString(36).substring(2, 6).toUpperCase()
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    setForm(f => ({ ...f, code: `${adj}-${suffixes}` }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.toUpperCase().trim(),
        description: form.description,
        nb_max: form.nb_max ? parseInt(form.nb_max) : null,
        expire_le: form.expire_le || null,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setCodes(prev => [data, ...prev])
      setForm({ code: '', description: '', nb_max: '10', expire_le: '' })
    } else {
      setError(data.error ?? 'Erreur')
    }
    setLoading(false)
  }

  async function toggleActif(id: string, actif: boolean) {
    const res = await fetch(`/api/admin/promos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actif: !actif }),
    })
    if (res.ok) {
      setCodes(prev => prev.map(c => c.id === id ? { ...c, actif: !actif } : c))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Créer un code */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-bold mb-4">Créer un code promo</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Code</label>
              <input type="text" required value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand uppercase"
                placeholder="ESSAI-AUNL" />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={generateCode}
                className="border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                🎲 Générer
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Description (visible côté client)</label>
            <input type="text" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              placeholder="Séance d'essai offerte — adhérents AUNL" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nb utilisations max</label>
              <input type="number" min="1" value={form.nb_max}
                onChange={e => setForm(f => ({ ...f, nb_max: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                placeholder="10 (vide = illimité)" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Expiration (optionnel)</label>
              <input type="date" value={form.expire_le}
                onChange={e => setForm(f => ({ ...f, expire_le: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 font-medium">
            💡 Tous les codes créés ici sont des codes de <strong>séance gratuite</strong> (100% de réduction).
          </div>
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60">
            {loading ? 'Création…' : 'Créer le code'}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Code</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Utilisations</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Expiration</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {codes.map(c => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="font-mono font-bold text-sm">{c.code}</div>
                  {c.description && <div className="text-xs text-gray-400 mt-0.5">{c.description}</div>}
                </td>
                <td className="px-5 py-3 text-sm font-medium">
                  {c.nb_utilises} / {c.nb_max ?? '∞'}
                </td>
                <td className="px-5 py-3 text-xs text-gray-500 font-medium">
                  {c.expire_le ? new Date(c.expire_le).toLocaleDateString('fr-FR') : 'Pas d\'expiration'}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => toggleActif(c.id, c.actif)}
                    className={`text-xs font-semibold transition-colors ${c.actif ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}>
                    {c.actif ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-400 font-medium">Aucun code promo</div>
        )}
      </div>
    </div>
  )
}
