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
            <span className="text-gray-600">Pass mensuel</span>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">Pass mensuel illimité</p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">Toutes les séances.<br />Un seul prélèvement.</h1>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Accès illimité à toutes les séances Avifit pour 49€/mois (29€ pour les adhérents AUNL). Vous vous inscrivez à chaque séance depuis le planning — votre place est offerte par le pass.
            </p>
          </div>

          {/* Récap offre */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <div className="grid grid-cols-2 gap-4">
              {([
                ['♾️', 'Accès illimité', 'Toutes les séances du mois'],
                ['📅', 'Inscription par séance', 'Vous gardez le contrôle'],
                ['💳', 'Prélèvement mensuel', '49€/mois · 29€ adhérent AUNL'],
                ['🚪', 'Sans engagement', 'Résiliable à tout moment'],
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
