import Navbar from '@/components/Navbar'

export default function CgvPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Conditions Générales de Vente</h1>
          <p className="text-sm text-gray-400 font-medium mb-10">Dernière mise à jour : mars 2025</p>
          <div className="bg-white rounded-xl border border-gray-200 p-8 prose prose-sm max-w-none">
            <h2>1. Prestataire</h2>
            <p>Les présentes CGV régissent les ventes de séances Avifit proposées par Alexis Lecointe, auto-entrepreneur, dans les locaux de l'Aviron Union Nautique de Lyon (AUNL), Lyon.</p>

            <h2>2. Tarifs</h2>
            <p>Séance unitaire : 10€. Abonnement mercredi : 8€/semaine. Tarif adhérent AUNL : 5€/séance ou 4€/semaine. Licence FFA annuelle : 45€ (obligatoire si non-licencié). Tous les prix sont TTC.</p>

            <h2>3. Réservation et paiement</h2>
            <p>La réservation est effective après paiement en ligne via Stripe. Une confirmation par email est envoyée immédiatement. Les paiements sont sécurisés par Stripe.</p>

            <h2>4. Abonnement</h2>
            <p>L'abonnement mercredi engage le client pour une durée minimale de 4 semaines. Les prélèvements sont hebdomadaires. Après la période d'engagement, la résiliation est possible à tout moment depuis la page "Mon abonnement" ou par email, avec effet à la fin de la semaine en cours.</p>

            <h2>5. Annulation par le prestataire</h2>
            <p>En cas d'annulation de séance (vacances scolaires, force majeure, maladie), aucun prélèvement n'est effectué pour les abonnés. Les réservations à l'unité sont remboursées intégralement.</p>

            <h2>6. Annulation par le client</h2>
            <p>Toute réservation à l'unité peut être annulée et remboursée jusqu'à 24h avant la séance. Passé ce délai, aucun remboursement n'est possible. Les abonnements ne sont pas remboursables pour les semaines déjà prélevées.</p>

            <h2>7. Licence FFA</h2>
            <p>La pratique de l'Avifit nécessite une licence FFA. Elle est prélevée une seule fois lors de la première réservation si le client n'est pas déjà licencié. Sa validité est annuelle.</p>

            <h2>8. Responsabilité</h2>
            <p>Le participant atteste être en bonne santé et apte à pratiquer une activité physique intense. Il est conseillé d'avoir un certificat médical de non-contre-indication à la pratique sportive.</p>

            <h2>9. Données personnelles</h2>
            <p>Les données collectées (nom, email) sont utilisées uniquement pour la gestion des réservations et l'envoi d'emails liés aux séances. Elles ne sont pas transmises à des tiers. Conformément au RGPD, vous pouvez demander la suppression de vos données par email.</p>

            <h2>10. Contact</h2>
            <p>Pour toute question : contactez Alexis par email via le site.</p>
          </div>
        </div>
      </main>
    </>
  )
}
