import { createContext } from 'react'
import type { AuthenticatedUsuario } from '../../client/types/authenticated-usuario'

export type AuthenticationContextType = {
  authenticatedUsuario?: AuthenticatedUsuario
  onAuthenticatedUsuarioChange?: (user: AuthenticatedUsuario) => void
  refreshAuthenticatedUsuario?: () => void
  loading?: boolean
  error?: unknown
}

export const AuthenticationContext = createContext<AuthenticationContextType>({})
