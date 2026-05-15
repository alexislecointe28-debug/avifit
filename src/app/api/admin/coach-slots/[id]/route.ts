import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data: slot } = await supabase.from('coach_slots').select('nb_reserves').eq('id', params.id).single()
  if (slot?.nb_reserves > 0) {
    return NextResponse.json({ error: 'Impossible de supprimer un créneau déjà réservé' }, { status: 409 })
  }
  await supabase.from('coach_slots').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { statut } = await req.json()
  const supabase = createServiceClient()
  await supabase.from('coach_slots').update({ statut }).eq('id', params.id)
  return NextResponse.json({ ok: true })
}
