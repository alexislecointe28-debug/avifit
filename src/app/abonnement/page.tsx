import Navbar from '@/components/Navbar'
import PassForm from '@/components/PassForm'

export default function PassPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
            <a href="/" className="hover:text-brand transition-colors">Accueil</a>
            <span>›</span>
            <span className="text-gray-600">Pass Séances</span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Pass Séances</p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">6 séances.<br />1 mois. Profitez.</h1>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Achetez votre pass et réservez librement vos séances pendant 30 jours. Aucun prélèvement automatique.
            </p>
          </div>

          {/* Récap offre */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <div className="grid grid-cols-2 gap-4">
              {([
                ['🎟️', '6 séances incluses', 'À utiliser librement'],
                ['📅', 'Valable 30 jours', 'À partir de la date d\'achat'],
                ['💳', 'Paiement unique', 'Aucun prélèvement récurrent'],
                ['✉️', 'Confirmation email', 'Votre pass activé immédiatement'],
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

          <PassForm />
        </div>
      </main>
    </>
  )
}
