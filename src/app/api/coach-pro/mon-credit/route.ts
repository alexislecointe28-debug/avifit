import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ credits: [] })

  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('coach_credits')
    .select('*')
    .eq('coach_email', email.toLowerCase().trim())
    .eq('statut', 'actif')
    .gte('expire_le', today)
    .order('expire_le', { ascending: true })

  return NextResponse.json({ credits: data ?? [] })
}
