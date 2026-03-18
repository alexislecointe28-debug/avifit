import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/admin-auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const body = await req.json()
  const { titre, type, date, heure_debut, heure_fin, places_max, prix, statut } = body

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('seances')
    .update({ titre, type, date, heure_debut, heure_fin, places_max, prix, statut })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const supabase = createServiceClient()
  const { error } = await supabase.from('seances').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
