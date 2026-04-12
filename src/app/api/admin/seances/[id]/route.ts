import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/admin-auth'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await req.json()
  const { titre, type, date, heure_debut, heure_fin, places_max, prix, statut, type_seance } = body

  const supabase = createServiceClient()

  // Récupérer l'ancien statut pour détecter une annulation
  const { data: ancienne } = await supabase.from('seances').select('statut, titre, date, heure_debut').eq('id', params.id).single()

  const { data, error } = await supabase
    .from('seances')
    .update({ titre, type, date, heure_debut, heure_fin, places_max, prix, statut, type_seance: type_seance ?? 'generale' })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Si la séance vient d'être annulée → notifier les inscrits
  if (statut === 'annule' && ancienne?.statut !== 'annule') {
    const { data: reservations } = await supabase
      .from('reservations')
      .select('client_email, client_prenom, client_nom')
      .eq('seance_id', params.id)
      .eq('statut', 'confirmed')

    if (reservations && reservations.length > 0) {
      const d = new Date((ancienne?.date ?? date) + 'T00:00:00')
      const jourFormate = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      const heureFormatee = (ancienne?.heure_debut ?? heure_debut).slice(0, 5)

      for (const resa of reservations) {
        resend.emails.send({
          from: 'Avifit AUNL <onboarding@resend.dev>',
          to: resa.client_email,
          subject: '⚠️ Séance annulée — Avifit AUNL',
          html: `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F7F6F2;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
    <div style="background:#DC2626;padding:28px;text-align:center;">
      <div style="font-size:28px;margin-bottom:6px;">⚠️</div>
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">Séance annulée</h1>
    </div>
    <div style="padding:28px;">
      <p style="color:#374151;font-size:15px;margin:0 0 16px;">Bonjour <strong>${resa.client_prenom}</strong>,</p>
      <p style="color:#374151;font-size:15px;margin:0 0 20px;">La séance du <strong style="text-transform:capitalize">${jourFormate} à ${heureFormatee}</strong> est annulée.</p>
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:14px;margin-bottom:20px;font-size:13px;color:#991B1B;">
        Votre réservation sera remboursée intégralement sous 5-10 jours ouvrés.
      </div>
      <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0;">Toutes nos excuses pour la gêne occasionnée.</p>
    </div>
    <div style="background:#F9FAFB;padding:14px;text-align:center;border-top:1px solid #E5E7EB;">
      <p style="font-size:12px;color:#9CA3AF;margin:0;">Avifit AUNL Lyon · Labellisé Avifit® FFA</p>
    </div>
  </div>
</body></html>`,
        }).catch(console.error)
      }
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const supabase = createServiceClient()
  const { error } = await supabase.from('seances').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
