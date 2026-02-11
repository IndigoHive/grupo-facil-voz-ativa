import axios, { type AxiosInstance } from 'axios'
import { AuthenticationClient } from './clients/authentication/authentication-client'

export type ClientOptions = {
  baseURL?: string
}

export type ClientRequestOptions = {
  signal?: AbortSignal
  timeout?: number
}

export class Client {
  private axios: AxiosInstance

  authentication: AuthenticationClient

  constructor (options: ClientOptions = {}) {
    this.axios = axios.create({
      baseURL: options.baseURL,
      withCredentials: true
    })

    this.authentication = new AuthenticationClient(this.axios)
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
