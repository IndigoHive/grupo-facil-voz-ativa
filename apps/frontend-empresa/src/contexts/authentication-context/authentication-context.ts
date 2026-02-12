import { createContext } from 'react'
import type { UsuarioResult } from '../../client/types/usuario-result'

export type AuthenticationContextType = {
  authenticatedUsuario?: UsuarioResult
  onAuthenticatedUsuarioChange?: (user: UsuarioResult) => void
  refreshAuthenticatedUsuario?: () => void
  loading?: boolean
  error?: unknown
}

export const AuthenticationContext = createContext<AuthenticationContextType>({})
