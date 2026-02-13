import { Building2, House, Settings2, User } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../components/ui/sidebar'
import type { ReactNode } from 'react'

type MenuItem = {
  label: string
  to: string
  icon: ReactNode
}

const menuItems: MenuItem[] = [
  {
    label: 'Inicio',
    to: `/admin`,
    icon: <House />
  },
  {
    label: 'Empresas',
    to: `/admin/empresas`,
    icon: <Building2 />
  },
  {
    label: 'Usuários',
    to: `/admin/usuarios`,
    icon: <User />
  },
  {
    label: 'Propriedades',
    to: `/admin/propriedades`,
    icon: <Settings2 />
  }
]

export function LayoutSidebarAdmin () {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="p-2">
            <p className='text-lg font-semibold'>Voz Ativa - Admin</p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.to}
                >
                  <Link to={item.to}>
                    {item.icon}
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
