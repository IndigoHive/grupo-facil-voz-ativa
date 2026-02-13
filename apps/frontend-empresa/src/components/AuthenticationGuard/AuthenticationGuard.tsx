import { type PropsWithChildren, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuthentication } from '../../hooks/use-authentication'

export type AuthenticationGuardProps = PropsWithChildren<{
  signInPath: string
  requiresEmpresa?: boolean
  isAdminRoute?: boolean
}>

export function AuthenticationGuard (props: AuthenticationGuardProps) {
  const { children, signInPath, requiresEmpresa = false, isAdminRoute = false } = props

  const authentication = useAuthentication()
  const navigate = useNavigate()
  const { empresaSlug } = useParams<{ empresaSlug: string }>()

  useEffect(() => {
    // Ainda está carregando, aguarda
    if (authentication.loading) {
      return
    }

    // Não está autenticado, redireciona para login
    if (!authentication.authenticatedUsuario) {
      navigate(signInPath, { replace: true })
      return
    }

    const hasEmpresa = !!authentication.authenticatedUsuario.empresa

    // Se a rota requer empresa mas o usuário não tem empresa selecionada
    if (requiresEmpresa && !hasEmpresa) {
      navigate('/', { replace: true })
      return
    }

    // Se está na rota de uma empresa, verifica se o slug bate
    if (requiresEmpresa && empresaSlug && hasEmpresa) {
      if (authentication.authenticatedUsuario.empresa?.slug !== empresaSlug) {
        // Slug não corresponde à empresa atual, redireciona para seleção
        navigate('/', { replace: true })
        return
      }
    }

    // Se tem empresa selecionada mas está tentando acessar a página de seleção
    // if (!requiresEmpresa && hasEmpresa) {
    //   navigate(`/${authentication.authenticatedUsuario.empresa?.slug}`, { replace: true })
    //   return
    // }

    // Se requer admin mas o usuário não é superadmin
    if (isAdminRoute && !authentication.authenticatedUsuario.isSuperAdmin) {
      navigate('/', { replace: true })
      return
    }
  }, [
    authentication.loading,
    authentication.authenticatedUsuario,
    navigate,
    signInPath,
    requiresEmpresa,
    isAdminRoute,
    empresaSlug
  ])

  // Renderiza loading
  if (authentication.loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // Renderiza erro
  if (authentication.error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar usuário autenticado</p>
      </div>
    )
  }

  // Não autenticado (será redirecionado pelo useEffect)
  if (!authentication.authenticatedUsuario) {
    return null
  }

  const hasEmpresa = !!authentication.authenticatedUsuario.empresa

  // Se requer empresa mas não tem (será redirecionado pelo useEffect)
  if (requiresEmpresa && !hasEmpresa) {
    return null
  }

  // Se requer empresa, verifica slug
  if (requiresEmpresa && empresaSlug && authentication.authenticatedUsuario.empresa?.slug !== empresaSlug) {
    return null
  }

  // Se não requer empresa mas tem (será redirecionado pelo useEffect)
  // if (!requiresEmpresa && hasEmpresa) {
  //   return null
  // }

  // Se requer admin mas não é superadmin (será redirecionado pelo useEffect)
  if (isAdminRoute && !authentication.authenticatedUsuario.isSuperAdmin) {
    return null
  }

  // Tudo certo, renderiza os children
  return <>{children}</>
}
