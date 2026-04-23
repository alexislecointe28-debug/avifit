import Navbar from '@/components/Navbar'

const FAQ = [
  { q: "Est-ce que je dois savoir ramer ?", r: "Non, aucun prérequis. L'ergomètre est accessible dès la première séance. Le coach vous explique tout au démarrage." },
  { q: "Qu'est-ce que je dois apporter ?", r: "Juste de l'eau et des chaussures de sport. Tout le matériel est sur place à l'AUNL." },
  { q: "C'est quoi la licence FFA ?", r: "La Fédération Française d'Aviron exige une licence annuelle pour pratiquer dans un club labellisé. Si vous êtes déjà licencié dans un club FFA (dont l'AUNL), vous en avez déjà une. Sinon, elle est de 45€/an et s'ajoute à votre première réservation." },
  { q: "C'est quoi le pass mensuel illimité ?", r: "Vous souscrivez une fois et accédez à toutes les séances du mois, autant que vous voulez. Stripe prélève 49€/mois (29€/mois pour les adhérents AUNL). Vous vous inscrivez à chaque séance depuis le planning — votre place est offerte par le pass." },
  { q: "Puis-je résilier le pass mensuel quand je veux ?", r: "Oui, sans engagement. Vous pouvez résilier à tout moment depuis la page 'Mon pass' ou par email. La résiliation prend effet à la fin du mois en cours (aucun prélèvement supplémentaire)." },
  { q: "Que se passe-t-il pendant les vacances scolaires ?", r: "Les séances sont annulées pendant les vacances scolaires de la Zone A (Lyon). Le prélèvement mensuel continue normalement, mais si des semaines entières sont suspendues vous pouvez nous contacter pour un ajustement." },
  { q: "Comment fonctionne le tarif adhérent AUNL ?", r: "Si votre email est dans la liste des membres de l'AUNL, le tarif réduit (5€/séance ou 29€/mois pour le pass illimité) s'applique automatiquement quand vous entrez votre email. Aucune démarche supplémentaire." },
  { q: "Combien de personnes par séance ?", r: "10 personnes maximum. Au-delà, les places sont indiquées comme 'Complet' sur le planning." },
  { q: "Où se situe l'AUNL ?", r: "L'Aviron Union Nautique de Lyon est situé bord de Saône, à Lyon. 59 quai Clémenceau, Caluire-et-Cuire." },
]

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2">FAQ</p>
          <h1 className="text-3xl font-bold tracking-tight mb-10">Questions fréquentes</h1>
          <div className="flex flex-col gap-3">
            {FAQ.map(({ q, r }) => (
              <div key={q} className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-bold mb-2">{q}</h2>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
