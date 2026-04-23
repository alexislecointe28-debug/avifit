import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ adherent: false, aboActif: false })

  const supabase = createServiceClient()
  const emailClean = email.toLowerCase().trim()

  const [adherentRes, aboRes] = await Promise.all([
    supabase.from('adherents').select('id').eq('email', emailClean).single(),
    supabase.from('abonnements').select('id').eq('client_email', emailClean).eq('statut', 'active').limit(1).maybeSingle(),
  ])

  return NextResponse.json({
    adherent: !!adherentRes.data,
    aboActif: !!aboRes.data,
  })
}
