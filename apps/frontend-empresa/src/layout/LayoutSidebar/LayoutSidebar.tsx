import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router"
import {
  House,
  ShieldUser,
  Key,
  User,
  ShieldCheck,
  Link2
} from "lucide-react"
import type { ReactNode } from "react"
import { useAuthentication } from '../../hooks/use-authentication'
import { useLogout } from '../../hooks/fetch/use-logout'
import { Button } from '../../components/ui/button'

type MenuItem = {
  label: string
  to?: string
  icon: ReactNode
  items?: {
    to: string
    label: string
    icon: ReactNode
  }[]
}

const MENU_ITEMS: MenuItem[] = [
  {
    to: "/",
    label: "Início",
    icon: <House />,
  },
  {
    label: "Admin",
    icon: <ShieldUser />,
    items: [
      {
        to: "/acessos",
        label: "Acessos",
        icon: <User />,
      },
      {
        to: "/chaves-de-api",
        label: "Chaves de API",
        icon: <Key />,
      },
      {
        to: "/consentimentos",
        label: "Consentimentos",
        icon: <ShieldCheck />,
      },
      {
        to: "/vinculo",
        label: "Vínculo",
        icon: <Link2 />,
      }
    ],
  },
]

export function LayoutSidebar() {
  const location = useLocation()
  const authentication = useAuthentication()

  const {
    mutateAsync: logout,
    isPending: isLoggingOut,
  } = useLogout()

  const handleLogout = async () => {
    await logout()

    authentication.refreshAuthenticatedUsuario?.()
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="p-2">
            <Link to="/">
              Voz Ativa
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {MENU_ITEMS.map((item) => (
          <SidebarGroup key={item.label}>
            <SidebarGroupContent>
              {item.items ? (
                <>
                  <SidebarGroupLabel>{item.label}</SidebarGroupLabel>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === subItem.to}
                        >
                          <Link to={subItem.to}>
                            {subItem.icon}
                            {subItem.label}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </>
              ) : (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.to}
                    >
                      <Link to={item.to || ""}>
                        {item.icon}
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Button variant='destructive' onClick={handleLogout} disabled={isLoggingOut}>
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
