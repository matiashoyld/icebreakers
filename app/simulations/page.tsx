export const dynamic = 'force-dynamic'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getSimulations } from '@/lib/services/simulation-service'
import Link from 'next/link'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'

export default async function SimulationsPage() {
  const simulations = await getSimulations()
  console.log('Fetched simulations:', simulations)

  return (
    <div className='flex flex-col gap-4 p-4 md:p-6 w-full max-w-7xl mx-auto'>
      <header className='flex items-center justify-between'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/'>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Simulations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className='flex-1'>
        <DataTable columns={columns} data={simulations} />
      </main>
    </div>
  )
}
