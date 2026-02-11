import { type PropsWithChildren, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthentication } from '../../hooks/use-authentication'

export type AuthenticationGuardProps = PropsWithChildren<{
  signInPath: string
}>

export function AuthenticationGuard (props: AuthenticationGuardProps) {
  const { children, signInPath } = props

  const authentication = useAuthentication()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authentication.loading && !authentication.authenticatedUsuario) {
      navigate(signInPath)
    }
  }, [authentication, navigate, signInPath])

  return (
    <>
      {authentication.error && 'Error loading authenticated user'}
      {authentication.loading && <>Carregando</>}
      {authentication.authenticatedUsuario && children}
    </>
  )
}
