import Navbar from '@/components/Navbar'
import AbonnementForm from '@/components/AbonnementForm'
import Link from 'next/link'

export default function AbonnementPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <Link href="/" className="hover:text-brand transition-colors">Accueil</Link>
            <span>›</span>
            <span className="text-gray-600">Pass saison</span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Pass saison 2025-2026</p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Toute la saison.<br />Zéro friction.</h1>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Choisissez votre rythme — 1 séance/semaine ou illimité — et réglez une seule fois pour toute la saison. Licence FFA incluse. Réservation séance par séance depuis le planning.
            </p>
          </div>

          {/* Points clés */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              {([
                ['🏅', 'Licence FFA incluse', 'Pas de démarche supplémentaire'],
                ['📅', 'Septembre → juin', 'Toute la saison sportive'],
                ['📋', 'Inscription par séance', 'Vous gardez le contrôle'],
                ['🎯', 'Coach certifié', 'FFA · Max 10 personnes'],
              ] as const).map(([icon, title, desc]) => (
                <div key={title} className="flex gap-3 items-start">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{title}</div>
                    <div className="text-xs text-gray-400 font-medium">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AbonnementForm />
        </div>
      </main>
    </>
  )
}
