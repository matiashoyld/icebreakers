import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Inter } from 'next/font/google'
import { Sidebar } from '../components/Sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <TooltipProvider>
          <div className='flex'>
            <Sidebar />
            <main className='flex-1 pl-14'>{children}</main>
          </div>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}
