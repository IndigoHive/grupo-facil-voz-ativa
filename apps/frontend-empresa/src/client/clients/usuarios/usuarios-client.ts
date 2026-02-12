import type { AxiosInstance } from 'axios'
import type { CreateUsuarioCommand, Usuario, CreateUsuarioResponse } from './usuarios-types'

export class UsuariosClient {
  private axios: AxiosInstance

  constructor (axios: AxiosInstance) {
    this.axios = axios
  }

  async create (data: CreateUsuarioCommand): Promise<CreateUsuarioResponse> {
    return (await this.axios.post('/usuarios', data)).data
  }

  async list (): Promise<Usuario[]> {
    return (await this.axios.get('/usuarios')).data
  }
}
