import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendConfirmationSeance } from '@/lib/emails'

export async function POST(req: NextRequest) {
  const { seanceId, nom, prenom, email, codePromo } = await req.json()

  if (!seanceId || !nom || !prenom || !email || !codePromo) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Valider le code côté serveur
  const { data: code } = await supabase
    .from('codes_promo')
    .select('*')
    .eq('code', codePromo.toUpperCase().trim())
    .eq('actif', true)
    .single()

  if (!code) return NextResponse.json({ error: 'Code invalide' }, { status: 400 })
  if (code.expire_le && new Date(code.expire_le) < new Date()) {
    return NextResponse.json({ error: 'Code expiré' }, { status: 400 })
  }
  if (code.nb_max !== null && code.nb_utilises >= code.nb_max) {
    return NextResponse.json({ error: 'Code épuisé' }, { status: 400 })
  }
  if (code.type !== 'gratuit') {
    return NextResponse.json({ error: 'Ce code ne permet pas une réservation gratuite' }, { status: 400 })
  }

  // Vérifier la séance
  const { data: seance } = await supabase
    .from('seances').select('*').eq('id', seanceId).single()

  if (!seance) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

  const dispo = seance.places_max - seance.places_reservees
  if (dispo <= 0) return NextResponse.json({ error: 'Séance complète' }, { status: 409 })

  // Vérif 1h avant
  const debut = new Date(`${seance.date}T${seance.heure_debut}`)
  if (debut <= new Date(Date.now() + 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Les inscriptions sont closes 1h avant la séance' }, { status: 409 })
  }

  // Créer la réservation directement
  const { data: resa, error } = await supabase
    .from('reservations')
    .insert({
      seance_id: seanceId,
      client_email: email,
      client_nom: nom,
      client_prenom: prenom,
      statut: 'confirmed',
      avec_licence_ffa: false,
      montant_total: 0,
      stripe_payment_id: `promo_${code.code}`,
    })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Incrémenter le compteur du code
  await supabase
    .from('codes_promo')
    .update({ nb_utilises: code.nb_utilises + 1 })
    .eq('id', code.id)

  // Email de confirmation
  await sendConfirmationSeance({
    to: email,
    prenom,
    titre: seance.titre,
    date: seance.date,
    heureDebut: seance.heure_debut,
    heureFin: seance.heure_fin,
    avecLicence: false,
    montant: 0,
  }).catch(console.error)

  return NextResponse.json({ ok: true, reservationId: resa.id })
}
