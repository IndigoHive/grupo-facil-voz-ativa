import axios from 'axios'

/**
 * Extrai a mensagem de erro de uma resposta da API
 * A API retorna { "erro": "mensagem" } quando ocorre um erro
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data
    if (typeof data === 'object' && data !== null && 'error' in data) {
      return String(data.error)
    }
  }

  return 'Ocorreu um erro inesperado'
}
