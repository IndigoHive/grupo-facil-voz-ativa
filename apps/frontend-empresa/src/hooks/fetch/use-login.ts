import { useMutation } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { LoginCommand } from '../../client/clients/authentication/authentication-types'

export function useLogin() {
  const client = useClient()

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (command: LoginCommand) => await client.authentication.login(command)
  })
}
