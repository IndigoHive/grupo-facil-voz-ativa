import type { AxiosInstance } from 'axios'
import type { CreateUsuarioCommand, CreateUsuarioResponse } from './usuarios-types'
import type { UsuarioResult } from '../../types/usuario-result'

export class UsuariosClient {
  private axios: AxiosInstance

  constructor (axios: AxiosInstance) {
    this.axios = axios
  }

  async create (data: CreateUsuarioCommand): Promise<CreateUsuarioResponse> {
    return (await this.axios.post('/usuarios', data)).data
  }

  async list (): Promise<UsuarioResult[]> {
    return (await this.axios.get('/usuarios')).data
  }
}
