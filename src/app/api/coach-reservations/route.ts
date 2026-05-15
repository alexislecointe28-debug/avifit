import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { slotId, email } = await req.json()
  if (!slotId || !email) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const supabase = createServiceClient()
  const emailClean = email.toLowerCase().trim()
  const today = new Date().toISOString().split('T')[0]

  // Vérifier crédit actif
  const { data: credits } = await supabase
    .from('coach_credits')
    .select('*')
    .eq('coach_email', emailClean)
    .eq('statut', 'actif')
    .gte('expire_le', today)
    .gt('nb_heures_restantes', 0)
    .order('expire_le', { ascending: true })
    .limit(1)

  const credit = credits?.[0]
  if (!credit) return NextResponse.json({ error: 'Aucun crédit disponible. Achetez des heures sur la page Coachs Pro.' }, { status: 402 })

  // Vérifier le slot
  const { data: slot } = await supabase.from('coach_slots').select('*').eq('id', slotId).single()
  if (!slot) return NextResponse.json({ error: 'Créneau introuvable' }, { status: 404 })
  if (slot.statut !== 'disponible') return NextResponse.json({ error: 'Créneau non disponible' }, { status: 409 })
  if (slot.nb_reserves >= slot.nb_coachs_max) return NextResponse.json({ error: 'Créneau complet' }, { status: 409 })

  // Vérifier que le coach n'a pas déjà ce créneau
  const { data: dejaResa } = await supabase.from('coach_reservations')
    .select('id').eq('slot_id', slotId).eq('coach_email', emailClean).eq('statut', 'confirmed').single()
  if (dejaResa) return NextResponse.json({ error: 'Vous avez déjà réservé ce créneau' }, { status: 409 })

  // Créer la réservation
  const { data: resa, error: resaErr } = await supabase.from('coach_reservations').insert({
    slot_id: slotId,
    credit_id: credit.id,
    coach_email: emailClean,
    coach_nom: credit.coach_nom,
    coach_prenom: credit.coach_prenom,
    coach_structure: credit.coach_structure,
    statut: 'confirmed',
  }).select().single()

  if (resaErr) return NextResponse.json({ error: resaErr.message }, { status: 500 })

  // Décrémenter crédit et incrémenter nb_reserves
  await Promise.all([
    supabase.from('coach_credits').update({ nb_heures_restantes: credit.nb_heures_restantes - 1 })
      .eq('id', credit.id),
    supabase.from('coach_slots').update({ nb_reserves: slot.nb_reserves + 1 })
      .eq('id', slotId),
  ])

  // Email admin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const dateStr = new Date(slot.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Avifit AUNL <noreply@avifit.fr>',
      to: 'avifit@aunl.fr',
      subject: `📅 Nouvelle réservation salle — ${credit.coach_prenom} ${credit.coach_nom}`,
      html: `<p><strong>${credit.coach_prenom} ${credit.coach_nom}</strong> (${credit.coach_structure})<br>
      a réservé le <strong>${dateStr}</strong> de <strong>${slot.heure_debut.slice(0,5)} à ${slot.heure_fin.slice(0,5)}</strong>.<br>
      Email : ${emailClean}<br>
      Crédits restants : ${credit.nb_heures_restantes - 1}h<br><br>
      <a href="${appUrl}/admin/coach-slots">Voir toutes les réservations →</a></p>`,
    })

    // Email coach
    await resend.emails.send({
      from: 'Avifit AUNL <noreply@avifit.fr>',
      to: emailClean,
      subject: `✅ Créneau confirmé — ${dateStr}`,
      html: `<p>Bonjour ${credit.coach_prenom},<br><br>
      Votre créneau est confirmé :<br>
      📅 <strong>${dateStr}</strong> · <strong>${slot.heure_debut.slice(0,5)} → ${slot.heure_fin.slice(0,5)}</strong><br><br>
      Il vous reste <strong>${credit.nb_heures_restantes - 1}h</strong> de crédit.<br><br>
      Pour annuler (jusqu'à 2h avant) : <a href="${appUrl}/mon-credit-coach">mon-credit-coach</a><br><br>
      À bientôt,<br>L'équipe Avifit AUNL</p>`,
    })
  } catch (e) { console.error('Email error:', e) }

  return NextResponse.json({ ok: true, reservation: resa })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ reservations: [] })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('coach_reservations')
    .select('*, coach_slots(date, heure_debut, heure_fin)')
    .eq('coach_email', email.toLowerCase().trim())
    .eq('statut', 'confirmed')
    .order('created_at', { ascending: false })

  return NextResponse.json({ reservations: data ?? [] })
}
