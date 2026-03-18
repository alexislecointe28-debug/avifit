import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avifit UNL Lyon — Cours collectifs sur ergomètre',
  description: 'Cours collectifs sur ergomètre labellisés FFA. 1h, 10 personnes max, tous niveaux. Union Nautique de Lyon.',
  keywords: ['avifit', 'ergomètre', 'aviron indoor', 'FFA', 'Lyon', 'cours collectifs'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
