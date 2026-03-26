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
            <p>Les présentes CGV régissent les réservations de séances Avifit proposées par Alexis Lecointe, dans les locaux de l&apos;Aviron Union Nautique de Lyon (AUNL), 59 quai Clémenceau, Caluire-et-Cuire. L&apos;encaissement est effectué directement par l&apos;AUNL.</p>

            <h2>2. Tarifs</h2>
            <p>Séance unitaire : 10€. Formule illimitée : 8€/semaine. Tarif adhérent AUNL : 5€/séance ou 4€/semaine. Licence FFA annuelle : 45€ si non-licencié (obligatoire pour la pratique). Tous les prix sont TTC.</p>

            <h2>3. Réservation</h2>
            <p>La réservation s&apos;effectue en ligne sur le site. Elle est confirmée par email dès validation. Le paiement est réglé directement auprès de l&apos;AUNL, sur place ou selon les modalités communiquées par le club. Aucun paiement en ligne n&apos;est requis pour valider une réservation.</p>

            <h2>4. Formule illimitée</h2>
            <p>La formule illimitée permet de réserver automatiquement une place à chaque séance, sans démarche hebdomadaire. Elle engage le participant pour une durée minimale de 4 semaines. Après cette période, la résiliation est possible à tout moment depuis la page &quot;Ma formule&quot; ou par email, avec effet à la fin de la semaine en cours. Les modalités de paiement sont définies avec l&apos;AUNL.</p>

            <h2>5. Annulation par le prestataire</h2>
            <p>En cas d&apos;annulation de séance (vacances scolaires Zone A, force majeure, maladie du coach), les participants inscrits en sont informés par email. Aucun règlement n&apos;est dû pour une séance annulée.</p>

            <h2>6. Annulation par le participant</h2>
            <p>Toute réservation peut être annulée en ligne jusqu&apos;à 24h avant le début de la séance, depuis la page &quot;Mes séances&quot;. Passé ce délai, l&apos;annulation n&apos;est plus possible et la place est considérée comme utilisée.</p>

            <h2>7. Licence FFA</h2>
            <p>La pratique de l&apos;Avifit dans un club labellisé FFA nécessite une licence fédérale annuelle. Si le participant n&apos;est pas déjà licencié dans un club FFA, la licence est à régler auprès de l&apos;AUNL. Sa validité est annuelle.</p>

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
