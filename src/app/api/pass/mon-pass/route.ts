import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('pass_seances')
    .select('id, nb_seances_restantes, nb_seances_total, achete_le, expire_le, statut')
    .eq('client_email', email.toLowerCase().trim())
    .eq('statut', 'actif')
    .gte('expire_le', today)
    .order('expire_le', { ascending: false })
    .limit(1)
    .single()

  if (!data) return NextResponse.json({ error: 'Aucun pass actif trouvé.' }, { status: 404 })
  return NextResponse.json({ pass: data })
}
