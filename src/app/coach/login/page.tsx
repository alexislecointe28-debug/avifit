'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function CoachLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/coach/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      window.location.href = '/coach'
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erreur')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/avifit-logo.png" alt="Avifit" width={100} height={32} className="h-8 w-auto mb-3" />
          <span className="text-xs text-gray-400 font-medium">Espace coach</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-xl font-bold mb-6 tracking-tight">Connexion coach</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="prenom@aunl.fr" autoFocus />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Mot de passe</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-brand text-white font-semibold py-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-60 text-sm">
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
