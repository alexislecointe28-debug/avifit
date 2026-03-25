import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  if (!code) return NextResponse.json({ valid: false, error: 'Code manquant' })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('codes_promo')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('actif', true)
    .single()

  if (!data) return NextResponse.json({ valid: false, error: 'Code invalide ou expiré' })

  // Vérifier expiration
  if (data.expire_le && new Date(data.expire_le) < new Date()) {
    return NextResponse.json({ valid: false, error: 'Ce code a expiré' })
  }

  // Vérifier nb utilisations
  if (data.nb_max !== null && data.nb_utilises >= data.nb_max) {
    return NextResponse.json({ valid: false, error: 'Ce code a atteint son nombre maximum d\'utilisations' })
  }

  return NextResponse.json({
    valid: true,
    type: data.type,
    valeur: data.valeur,
    description: data.description,
    gratuit: data.type === 'gratuit',
  })
}
