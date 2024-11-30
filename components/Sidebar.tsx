'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Beaker, Home, IceCream, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { name: 'Home', icon: <Home className='h-5 w-5' />, href: '/' },
  {
    name: 'Simulations',
    icon: <Beaker className='h-5 w-5' />,
    href: '/simulations',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const getActivePage = (path: string) => {
    if (path === '/') return 'Home'
    if (path.startsWith('/simulations')) return 'Simulations'
    return 'Home' // Default to Home if no match
  }

  const activePage = getActivePage(pathname)

  return (
    <TooltipProvider>
      <aside className='fixed inset-y-0 left-0 z-10 w-14 flex-col border-r bg-background hidden sm:flex'>
        <nav className='flex flex-col items-center gap-4 px-2 sm:py-5'>
          <Link
            href='/'
            className='group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base'
          >
            <IceCream className='h-4 w-4 transition-all group-hover:scale-110' />
            <span className='sr-only'>Icebreakers</span>
          </Link>
          {menuItems.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    activePage === item.name
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  } md:h-8 md:w-8`}
                >
                  {item.icon}
                  <span className='sr-only'>{item.name}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right'>{item.name}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className='mt-auto flex flex-col items-center gap-4 px-2 sm:py-5'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href='/settings'
                className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8'
              >
                <Settings className='h-5 w-5' />
                <span className='sr-only'>Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>Settings</TooltipContent>
          </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  )
}
