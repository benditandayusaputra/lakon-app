import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })

export const metadata: Metadata = {
  title: 'Lakon',
  description: 'Belajar bahasa isyarat Indonesia lewat skenario transaksi nyata.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={fraunces.variable}>
      <body className="bg-halaman text-teks min-h-dvh antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
