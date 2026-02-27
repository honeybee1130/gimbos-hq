import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gimbos HQ — Ape Church Command Center',
  description: 'Gimbos campaign command center. Lore, timeline, todos, chat.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
