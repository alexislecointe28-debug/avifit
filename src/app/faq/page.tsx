import Navbar from '@/components/Navbar'

const FAQ = [
  { q: "Est-ce que je dois savoir ramer ?", r: "Non, aucun prérequis. L'ergomètre est accessible dès la première séance. Le coach vous explique tout au démarrage." },
  { q: "Qu'est-ce que je dois apporter ?", r: "Juste de l'eau et des chaussures de sport. Tout le matériel est sur place à l'AUNL." },
  { q: "C'est quoi la licence FFA et est-ce que je dois la payer ?", r: "Les passes saison incluent la licence FFA — vous n'avez rien de plus à payer ni à faire. Pour une séance à l'unité, si vous n'avez pas encore de licence FFA, elle est ajoutée automatiquement (+45€). Il suffit de cocher 'J'ai déjà une licence FFA' si vous êtes déjà licencié dans un autre club pour l'enlever." },
  { q: "C'est quoi un pass saison ?", r: "Vous réglez une seule fois et accédez aux séances Avifit du 1er septembre au 30 juin. Deux formules : 1×/semaine (280€, 180€ adhérent AUNL) ou illimité (399€, 249€ adhérent AUNL). La licence FFA est incluse dans les deux. Vous vous inscrivez à chaque séance depuis le planning." },
  { q: "Puis-je annuler mon pass saison ?", r: "Le pass saison est un paiement unique non remboursable. En cas d'impossibilité médicale de pratiquer, contactez-nous — nous trouverons une solution au cas par cas." },
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
