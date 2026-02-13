import type { AxiosInstance } from 'axios'
import type {
  CreateEmpresaCommand,
  UpdateEmpresaCommand,
  Empresa,
  CleanUsuarioSenhaResponse,
  CreateTipoPropriedadeCommand,
  CreateTipoPropriedadeResult,
  UpdateTipoPropriedadeCommand,
  UpdateTipoPropriedadeResult,
  TipoPropriedade
} from './admin-types'

export class AdminClient {
  private axios: AxiosInstance

  constructor (axios: AxiosInstance) {
    this.axios = axios
  }

  async createEmpresa (data: CreateEmpresaCommand): Promise<void> {
    return (await this.axios.post('/admin/empresas', data)).data
  }

  async listEmpresas (): Promise<Empresa[]> {
    return (await this.axios.get('/admin/empresas')).data
  }

  async updateEmpresa (id: string, data: UpdateEmpresaCommand): Promise<void> {
    return (await this.axios.patch(`/admin/empresas/${id}`, data)).data
  }

  async cleanUsuarioSenha (id: string): Promise<CleanUsuarioSenhaResponse> {
    return (await this.axios.post(`/admin/usuarios/${id}/limpar-senha`)).data
  }
  // Tipos-Propriedade
  async createTipoPropriedade(data: CreateTipoPropriedadeCommand): Promise<CreateTipoPropriedadeResult> {
    return (await this.axios.post('/admin/tipos-propriedade', data)).data;
  }

  async updateTipoPropriedade(id: string, data: UpdateTipoPropriedadeCommand): Promise<UpdateTipoPropriedadeResult> {
    return (await this.axios.patch(`/admin/tipos-propriedade/${id}`, data)).data;
  }

  async listTipoPropriedades(): Promise<TipoPropriedade[]> {
    return (await this.axios.get('/admin/tipos-propriedade')).data;
  }
}
