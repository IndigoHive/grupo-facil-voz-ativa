import type { AxiosInstance } from 'axios'
import type { Ligacao, Page, LigacoesPageQuery } from './ligacoes-types'

export class LigacoesClient {
  private axios: AxiosInstance

  constructor (axios: AxiosInstance) {
    this.axios = axios
  }

  async getPage (query?: LigacoesPageQuery): Promise<Page<Ligacao>> {
    return (await this.axios.get('/ligacoes', { params: query })).data
  }
}
