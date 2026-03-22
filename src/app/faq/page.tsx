import Navbar from '@/components/Navbar'

const FAQ = [
  { q: "Est-ce que je dois savoir ramer ?", r: "Non, aucun prérequis. L'ergomètre est accessible dès la première séance. Le coach vous explique tout au démarrage." },
  { q: "Qu'est-ce que je dois apporter ?", r: "Juste de l'eau et des chaussures de sport. Tout le matériel est sur place à l'AUNL." },
  { q: "C'est quoi la licence FFA ?", r: "La Fédération Française d'Aviron exige une licence annuelle pour pratiquer dans un club labellisé. Si vous êtes déjà licencié dans un club FFA (dont l'AUNL), vous en avez déjà une. Sinon, elle est de 45€/an et s'ajoute à votre première réservation." },
  { q: "C'est quoi l'formule illimitée mercredi ?", r: "Vous vous inscrivez une seule fois et votre place du mercredi est automatiquement réservée chaque semaine. Stripe prélève 8€ (ou 4€ pour les adhérents AUNL) chaque mercredi. Vous n'avez plus rien à faire." },
  { q: "Puis-je résilier l'formule illimitée quand je veux ?", r: "L'engagement minimum est de 4 semaines (1 mois). Après cette période, vous pouvez résilier à tout moment depuis la page 'Mon formule illimitée' ou par email. La résiliation prend effet à la fin de la semaine en cours." },
  { q: "Que se passe-t-il pendant les vacances scolaires ?", r: "Les séances sont annulées pendant les vacances scolaires de la Zone A (Lyon). Aucun prélèvement n'est effectué les semaines sans séance." },
  { q: "Comment fonctionne le tarif adhérent AUNL ?", r: "Si votre email est dans la liste des membres de l'AUNL, le tarif 5€ (ou 4€/semaine en formule illimitée) s'applique automatiquement quand vous entrez votre email à la réservation. Aucune démarche supplémentaire." },
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
