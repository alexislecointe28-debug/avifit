import ScrollToTop from '@/components/ScrollToTop'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avifit AUNL — Ergomètre indoor · Caluire-et-Cuire Lyon',
  description: 'Séances sur ergomètre labellisées Avifit FFA. 1h, 10 personnes max, coach certifié. 59 quai Clémenceau, Caluire-et-Cuire (Lyon).',
  keywords: ['avifit', 'ergomètre', 'aviron indoor', 'FFA', 'Lyon', 'Caluire', 'avifit lyon', 'ergomètre lyon', 'rameur indoor lyon', 'avifit caluire'],
  openGraph: {
    title: 'Avifit AUNL — Ergomètre indoor · Lyon',
    description: 'Séances sur ergomètre à Caluire-et-Cuire. Labellisé Avifit® FFA.',
    url: 'https://avifit.vercel.app',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}<ScrollToTop /></body>
    </html>
  )
}
