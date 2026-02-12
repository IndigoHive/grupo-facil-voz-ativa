import type { AxiosInstance } from 'axios'
import type { Empresa, LoginCommand, ResetUsuarioSenhaCommand, SelectEmpresaCommand } from './authentication-types'
import type { UsuarioResult } from '../../types/usuario-result'

export class AuthenticationClient {
  private axios: AxiosInstance

  constructor (axios: AxiosInstance) {
    this.axios = axios
  }

  async login (data: LoginCommand): Promise<UsuarioResult> {
    return (await this.axios.post('/auth/login', data)).data
  }

  async logout (): Promise<void> {
    return (await this.axios.post('/auth/logout')).data
  }

  async selectEmpresa (command: SelectEmpresaCommand): Promise<UsuarioResult> {
    return (await this.axios.post('/auth/select-empresa', command)).data
  }

  async getEmpresasDisponiveis (): Promise<Empresa[]> {
    return (await this.axios.get('/auth/empresas')).data
  }

  async me(): Promise<UsuarioResult> {
    return (await this.axios.get('/auth/me')).data
  }

  async resetSenha (data: ResetUsuarioSenhaCommand) {
    return (await this.axios.post('/auth/reset-senha', data)).data
  }
}
