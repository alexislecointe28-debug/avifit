import Navbar from '@/components/Navbar'

export default function CgvPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Conditions Générales de Vente</h1>
          <p className="text-sm text-gray-400 font-medium mb-10">Dernière mise à jour : mars 2026</p>
          <div className="bg-white rounded-xl border border-gray-200 p-8 prose prose-sm max-w-none">

            <h2>1. Prestataire</h2>
            <p>Les présentes CGV régissent les réservations et ventes de séances Avifit proposées par Alexis Lecointe, dans les locaux de l&apos;Aviron Union Nautique de Lyon (AUNL), 59 quai Clémenceau, Caluire-et-Cuire. L&apos;encaissement est effectué par l&apos;AUNL.</p>

            <h2>2. Tarifs</h2>
            <p>Séance unitaire : 10€. Pass saison 1×/semaine : 280€. Pass saison illimité : 399€. Tarifs adhérent AUNL : 5€/séance, 180€/saison 1×, 249€/saison illimitée. Licence FFA incluse dans les passes saison. Licence FFA annuelle : 45€ si non-licencié (obligatoire pour la pratique). Tous les prix sont TTC.</p>

            <h2>3. Réservation et paiement</h2>
            <p>La réservation est effective après paiement en ligne sécurisé via Stripe. Une confirmation par email est envoyée immédiatement. Les paiements sont traités par Stripe au bénéfice de l&apos;AUNL.</p>

            <h2>4. Passes saison</h2>
            <p>Les passes saison (1×/semaine ou illimité) donnent accès aux séances Avifit du 1er septembre au 30 juin. Le participant s&apos;inscrit à chaque séance depuis le planning. La licence FFA est incluse dans le tarif. Le paiement est unique, effectué à la souscription. En cas de résiliation, aucun remboursement prorata n&apos;est automatique — contacter le club.</p>

            <h2>5. Annulation par le prestataire</h2>
            <p>En cas d&apos;annulation de séance (vacances scolaires Zone A, force majeure, maladie du coach), les participants inscrits en sont informés par email. Les réservations à l&apos;unité sont remboursées intégralement. En cas de suspension prolongée affectant le pass mensuel, un ajustement peut être demandé par email.</p>

            <h2>6. Annulation par le participant</h2>
            <p>Toute réservation peut être annulée en ligne jusqu&apos;à 24h avant le début de la séance, depuis la page &quot;Mes séances&quot;. Passé ce délai, l&apos;annulation n&apos;est plus possible et la place est considérée comme utilisée — aucun remboursement ne sera effectué. Le paiement du pass saison n&apos;est pas remboursable sauf accord exceptionnel du club.</p>

            <h2>7. Licence FFA</h2>
            <p>La pratique de l&apos;Avifit dans un club labellisé FFA nécessite une licence fédérale annuelle. Elle est ajoutée automatiquement au paiement lors de la première réservation si le participant n&apos;est pas déjà licencié. Sa validité est annuelle.</p>

            <h2>8. Responsabilité</h2>
            <p>Le participant atteste être en bonne santé et apte à pratiquer une activité physique intense. Un certificat médical de non-contre-indication à la pratique sportive est fortement recommandé. L&apos;AUNL et le coach déclinent toute responsabilité en cas d&apos;accident résultant d&apos;une contre-indication médicale non déclarée.</p>

            <h2>9. Données personnelles</h2>
            <p>Les données collectées (nom, prénom, email) sont utilisées uniquement pour la gestion des réservations et l&apos;envoi d&apos;emails de confirmation ou de rappel. Elles ne sont pas transmises à des tiers. Conformément au RGPD, vous pouvez demander la consultation, modification ou suppression de vos données par email.</p>

            <h2>10. Contact</h2>
            <p>Pour toute question : contactez Alexis par email via le site, ou à l&apos;AUNL, 59 quai Clémenceau, Caluire-et-Cuire.</p>

          </div>
        </div>
      </main>
    </>
  )
}
