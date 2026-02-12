import { useQueryClient } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { AuthenticationContext } from './authentication-context'
import { useAuthenticationMe } from '../../hooks/fetch/use-authentication-me'
import type { AuthenticatedUsuario } from '../../client/types/authenticated-usuario'

export type AuthenticationProviderProps = PropsWithChildren

export function AuthenticationProvider (props: PropsWithChildren) {
  const { children } = props

  const queryClient = useQueryClient()

  const getMe = useAuthenticationMe()

  const handleChange = (usuario: AuthenticatedUsuario | undefined) => {
    // Atualiza o cache do React Query
    queryClient.setQueryData(['auth.getMe'], usuario)
  }

  const handleRefresh = async () => {
    const result = await getMe.refetch()
    return result
  }

  return (
    <AuthenticationContext.Provider
      value={{
        authenticatedUsuario: getMe.data,
        refreshAuthenticatedUsuario: handleRefresh,
        onAuthenticatedUsuarioChange: handleChange,
        loading: getMe.isPending,
        error: getMe.error
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  )
}
