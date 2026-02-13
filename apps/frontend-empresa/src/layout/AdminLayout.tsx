import type { PropsWithChildren } from 'react'
import { Outlet } from 'react-router'
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { LayoutSidebarAdmin } from './LayoutSidebarAdmin'

export type AdminLayoutProps = PropsWithChildren

export function AdminLayout (props: AdminLayoutProps) {
  const { children } = props

  return (
    <SidebarProvider>
      <LayoutSidebarAdmin />
        <SidebarTrigger />
        <main className="w-full max-w-7xl mx-auto py-4 px-4">
          {children}
          <Outlet />
        </main>
    </SidebarProvider>
  )
}
