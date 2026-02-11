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
    queryClient.setQueryData(['auth.getMe'], usuario)
  }

  return (
    <AuthenticationContext.Provider
      value={{
        authenticatedUsuario: getMe.data,
        refreshAuthenticatedUsuario: getMe.refetch,
        onAuthenticatedUsuarioChange: handleChange,
        loading: getMe.isPending,
        error: getMe.error
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  )
}
