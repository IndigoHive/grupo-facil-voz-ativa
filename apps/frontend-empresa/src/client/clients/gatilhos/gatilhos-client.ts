import type { AxiosInstance } from 'axios'
import type { CreateGatilhoCommand, UpdateGatilhoCommand, Gatilho } from './gatilhos-types'

export class GatilhosClient {
  private axios: AxiosInstance

  constructor (axios: AxiosInstance) {
    this.axios = axios
  }

  async create (data: CreateGatilhoCommand): Promise<Gatilho> {
    return (await this.axios.post('/gatilhos', data)).data
  }

  async update (id: string, data: UpdateGatilhoCommand): Promise<Gatilho> {
    return (await this.axios.patch(`/gatilhos/${id}`, data)).data
  }

  async delete (id: string): Promise<void> {
    return (await this.axios.delete(`/gatilhos/${id}`)).data
  }

  async list (): Promise<Gatilho[]> {
    return (await this.axios.get('/gatilhos')).data
  }
}
