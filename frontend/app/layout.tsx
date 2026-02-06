import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import ToastContainer from './components/Toast'

export const metadata: Metadata = {
  title: 'Energy Contract Marketplace',
  description: 'Browse and manage energy supply contracts',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-xl text-gray-900">Energy Marketplace</span>
              </Link>
              <div className="flex gap-6">
                <Link href="/contracts" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Contracts
                </Link>
                <Link href="/portfolio" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Portfolio
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <ToastContainer />
      </body>
    </html>
  )
}
