import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  // Accepte slotId (1 slot) ou slotIds (N slots consécutifs)
  const slotIds: string[] = body.slotIds ?? (body.slotId ? [body.slotId] : [])
  const { email } = body
  if (!slotIds.length || !email) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  const slotId = slotIds[0] // slot principal pour les vérifs

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
  const nbHeures = slotIds.length
  if (credit.nb_heures_restantes < nbHeures) return NextResponse.json({ error: `Crédit insuffisant — il vous faut ${nbHeures}h mais vous n'en avez que ${credit.nb_heures_restantes}h.` }, { status: 402 })

  // Vérifier tous les slots demandés
  const { data: slots } = await supabase.from('coach_slots')
    .select('*').in('id', slotIds).eq('statut', 'disponible')
  if (!slots || slots.length !== slotIds.length) return NextResponse.json({ error: 'Un ou plusieurs créneaux sont indisponibles' }, { status: 409 })
  const slotPrincipal = slots.find(s => s.id === slotId) ?? slots[0]
  for (const s of slots) {
    if (s.nb_reserves >= s.nb_coachs_max) return NextResponse.json({ error: `Créneau ${s.heure_debut.slice(0,5)} complet` }, { status: 409 })
  }

  // Vérifier doublons pour cet email
  const { data: dejaResas } = await supabase.from('coach_reservations')
    .select('slot_id').in('slot_id', slotIds).eq('coach_email', emailClean).eq('statut', 'confirmed')
  if (dejaResas && dejaResas.length > 0) return NextResponse.json({ error: 'Vous avez déjà réservé un de ces créneaux' }, { status: 409 })

  // Créer toutes les réservations
  const insertData = slots.map(s => ({
    slot_id: s.id,
    credit_id: credit.id,
    coach_email: emailClean,
    coach_nom: credit.coach_nom,
    coach_prenom: credit.coach_prenom,
    coach_structure: credit.coach_structure,
    statut: 'confirmed',
  }))
  const { error: resaErr } = await supabase.from('coach_reservations').insert(insertData)
  if (resaErr) return NextResponse.json({ error: resaErr.message }, { status: 500 })
  const resa = insertData[0]

  // Décrémenter crédit de N heures + incrémenter nb_reserves de chaque slot
  await Promise.all([
    supabase.from('coach_credits')
      .update({ nb_heures_restantes: credit.nb_heures_restantes - slotIds.length })
      .eq('id', credit.id),
    ...slots.map(s => supabase.from('coach_slots')
      .update({ nb_reserves: s.nb_reserves + 1 }).eq('id', s.id)),
  ])

  // Email admin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const dateStr = new Date(slotPrincipal.slot_date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Avifit AUNL <noreply@avifit.fr>',
      to: 'avifit@aunl.fr',
      subject: `📅 Nouvelle réservation salle — ${credit.coach_prenom} ${credit.coach_nom}`,
      html: `<p><strong>${credit.coach_prenom} ${credit.coach_nom}</strong> (${credit.coach_structure})<br>
      a réservé le <strong>${dateStr}</strong> de <strong>${slotPrincipal.heure_debut.slice(0,5)} à ${slots[slots.length-1].heure_fin.slice(0,5)}</strong> (${slotIds.length}h).<br>
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
      📅 <strong>${dateStr}</strong> · <strong>${slotPrincipal.heure_debut.slice(0,5)} → ${slots[slots.length-1].heure_fin.slice(0,5)}</strong><br><br>
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
