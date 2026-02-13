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
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router"
import {
  House,
  ShieldUser,
  User,
  Send,
  KeyRound
} from "lucide-react"
import type { ReactNode } from "react"
import { useAuthentication } from '../../hooks/use-authentication'
import { useLogout } from '../../hooks/fetch/use-logout'
import { Button } from '../../components/ui/button'
import { useEmpresaDisponiveis } from '../../hooks/fetch/use-empresa-disponiveis'
import { useSelectEmpresa } from '../../hooks/fetch/use-select-empresa'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '../../components/ui/select'

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
    label: "Admin",
    icon: <ShieldUser />,
    items: [
      {
        to: "/gatilhos",
        label: "Gatilhos",
        icon: <Send />,
      },
      {
        to: "/usuarios",
        label: "Usuários",
        icon: <User />,
      },
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

  const {
    data: empresasDisponiveis,
    isPending: isLoadingEmpresas
  } = useEmpresaDisponiveis()

  const {
    mutateAsync: selectEmpresa,
    isPending: isSelectingEmpresa
  } = useSelectEmpresa()

  const handleSelectEmpresa = async (empresaId: string) => {
    await selectEmpresa({ empresaId })
    authentication.refreshAuthenticatedUsuario?.()
  }

  const empresaSlug = authentication.authenticatedUsuario?.empresa?.slug
  const empresaId = authentication.authenticatedUsuario?.empresa?.id

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="p-2">
            <p className='text-lg font-semibold'>Voz Ativa</p>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Select
              value={empresaId}
              onValueChange={(value) => handleSelectEmpresa(value)}
              disabled={isSelectingEmpresa || isLoadingEmpresas}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {empresasDisponiveis && empresasDisponiveis.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === `/${empresaSlug}`}
              >
                <Link to={`/${empresaSlug}`}>
                  <House />
                  Inicio
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === `/${empresaSlug}/chaves-api`}
              >
                <Link to={`/${empresaSlug}/chaves-api`}>
                  <KeyRound />
                  Chaves API
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
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
                          isActive={location.pathname.includes(subItem.to)}
                        >
                          <Link to={`/${empresaSlug}/${subItem.to}`}>
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
        <SidebarMenu>
          {authentication.authenticatedUsuario?.isSuperAdmin && (
            <SidebarMenuItem>
              <Link to='/admin'>
                <Button className='w-full' variant='outline' disabled={isLoggingOut}>
                  Super Admin
                </Button>
              </Link>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <Button className='w-full' variant='destructive' onClick={handleLogout} disabled={isLoggingOut}>
              Sair
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
