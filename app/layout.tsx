import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meme Generator',
  description: 'Meme Generator using GEN Ai and OG templates',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
