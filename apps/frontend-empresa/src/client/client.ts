import axios, { type AxiosInstance } from 'axios'
import { AuthenticationClient } from './clients/authentication/authentication-client'
import { ChavesApiClient } from './clients/chaves-api/chaves-api-client'
import { AdminClient } from './clients/admin/admin-client'
import { GatilhosClient } from './clients/gatilhos/gatilhos-client'
import { LigacoesClient } from './clients/ligacoes/ligacoes-client'
import { UsuariosClient } from './clients/usuarios/usuarios-client'

export type ClientOptions = {
  baseURL?: string
}

export type ClientRequestOptions = {
  signal?: AbortSignal
  timeout?: number
}

export class Client {
  private axios: AxiosInstance

  admin: AdminClient
  authentication: AuthenticationClient
  chavesApi: ChavesApiClient
  gatilhos: GatilhosClient
  ligacoes: LigacoesClient
  usuarios: UsuariosClient

  constructor (options: ClientOptions = {}) {
    this.axios = axios.create({
      baseURL: options.baseURL,
      withCredentials: true
    })

    this.admin = new AdminClient(this.axios)
    this.authentication = new AuthenticationClient(this.axios)
    this.chavesApi = new ChavesApiClient(this.axios)
    this.gatilhos = new GatilhosClient(this.axios)
    this.ligacoes = new LigacoesClient(this.axios)
    this.usuarios = new UsuariosClient(this.axios)
  }

  static isBadRequest (error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 400
  }

  static isConflict (error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 409
  }

  static isForbidden (error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 403
  }

  static isNotFound (error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 404
  }

  static isRateLimitExceeded (error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 429
  }
}
