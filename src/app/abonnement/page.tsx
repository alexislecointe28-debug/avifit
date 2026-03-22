import Navbar from '@/components/Navbar'
import AbonnementForm from '@/components/AbonnementForm'

export default function AbonnementPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <a href="/" className="hover:text-brand transition-colors">Accueil</a>
            <span>›</span>
            <span className="text-gray-600">Formule illimitée</span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Formule illimitée</p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Inscrivez-vous une fois.<br />Venez quand vous voulez.</h1>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Votre place est réservée automatiquement à chaque séance. Vous n&apos;avez plus jamais à y penser.
            </p>
          </div>

          {/* Récap offre */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['📅', 'Chaque séance', 'Votre place vous attend — rien à faire'],
                ['💳', '8€ / semaine', 'Prélevé automatiquement'],
                ['🔒', 'Sans engagement', 'après 1 mois minimum'],
                ['✉️', 'Confirmation email', 'Rappel avant chaque séance'],
              ].map(([icon, title, desc]) => (
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
