import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Santé Connect Cameroun | Votre Santé, Notre Priorité',
  description: 'Plateforme de santé numérique connectant patients et professionnels de santé au Cameroun. Rendez-vous en ligne, pharmacies, télémédecine et plus.',
  keywords: 'santé cameroun, médecin en ligne, rendez-vous médical, pharmacie cameroun, télémédecine',
  openGraph: {
    title: 'Santé Connect Cameroun',
    description: 'Votre santé, notre priorité. Plateforme de santé numérique au Cameroun.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
