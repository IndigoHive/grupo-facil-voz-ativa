import type { PropsWithChildren } from 'react'
import { Outlet } from 'react-router'
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { LayoutSidebar } from './LayoutSidebar'

export type LayoutProps = PropsWithChildren

export function Layout (props: LayoutProps) {
  const { children } = props

  return (
    <SidebarProvider>
      <LayoutSidebar />
        <SidebarTrigger />
        <main className="w-full max-w-7xl mx-auto py-4">
          {children}
          <Outlet />
        </main>
    </SidebarProvider>
  )
}
