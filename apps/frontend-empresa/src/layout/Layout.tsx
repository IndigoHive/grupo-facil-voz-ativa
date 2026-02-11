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
      <main className="w-full">
        <SidebarTrigger />
        {children}
        <Outlet />
      </main>
    </SidebarProvider>
  )
}
