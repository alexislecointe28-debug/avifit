export type SeanceType = 'avifit_debutant' | 'avifit_intermediaire' | 'avifit_tous_niveaux'

export type SeanceStatut = 'disponible' | 'complet' | 'annule'

export interface Seance {
  id: string
  titre: string
  type: SeanceType
  date: string        // ISO date
  heure_debut: string // "19:00"
  heure_fin: string   // "20:00"
  places_max: number
  places_reservees: number
  prix: number
  statut: SeanceStatut
  type_seance?: string
  created_at: string
}

export type ReservationStatut = 'pending' | 'confirmed' | 'cancelled'

export interface Reservation {
  id: string
  seance_id: string
  client_email: string
  client_nom: string
  client_prenom: string
  statut: ReservationStatut
  stripe_payment_id: string | null
  stripe_session_id: string | null
  avec_licence_ffa: boolean
  montant_total: number // en centimes
  created_at: string
}

export type FormatAchat = 'seance' | 'forfait'

export interface AchatForfait {
  id: string
  client_email: string
  client_nom: string
  client_prenom: string
  seances_restantes: number
  expire_le: string
  stripe_payment_id: string
  created_at: string
}
