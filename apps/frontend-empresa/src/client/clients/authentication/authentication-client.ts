import type { AxiosInstance } from 'axios'
import type { LoginCommand, ResetUsuarioSenhaCommand } from './authentication-types'
import type { AuthenticatedUsuario } from '../../types/authenticated-usuario'

export class AuthenticationClient {
  private axios: AxiosInstance

  constructor (axios: AxiosInstance) {
    this.axios = axios
  }

  async login (data: LoginCommand): Promise<AuthenticatedUsuario> {
    return (await this.axios.post('/auth/login', data)).data
  }

  async logout (): Promise<void> {
    return (await this.axios.post('/auth/logout')).data
  }

  async me(): Promise<AuthenticatedUsuario> {
    return (await this.axios.get('/auth/me')).data
  }

  async resetSenha (data: ResetUsuarioSenhaCommand) {
    return (await this.axios.post('/auth/reset-senha', data)).data
  }
}
