import { useContext } from 'react'
import { AuthenticationContext } from '../../contexts/authentication-context'

export function useAuthentication () {
  return useContext(AuthenticationContext)
}
