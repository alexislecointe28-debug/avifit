import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avifit AUNL — Séances sur ergomètre · Lyon',
  description: 'Séances sur ergomètre labellisées FFA. 1h, 10 personnes max. Aviron Union Nautique de Lyon.',
  keywords: ['avifit', 'ergomètre', 'aviron indoor', 'FFA', 'Lyon', 'avifit lyon'],
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
