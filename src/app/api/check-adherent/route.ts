import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ adherent: false })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('adherents')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single()

  return NextResponse.json({ adherent: !!data })
}
