import type { AxiosInstance } from 'axios'
import type { ChaveApi, CreateChaveApiCommand, CreateChaveApiResult } from './chaves-api-types'

export class ChavesApiClient {
  private axios: AxiosInstance

  constructor (axios: AxiosInstance) {
    this.axios = axios
  }

  async create (data: CreateChaveApiCommand): Promise<CreateChaveApiResult> {
    return (await this.axios.post('/chave-api', data)).data
  }

  async list (): Promise<ChaveApi[]> {
    return (await this.axios.get('/chave-api')).data
  }

  async revoke (id: string): Promise<void> {
    return (await this.axios.post(`/chave-api/${id}/revogar`)).data
  }
}
