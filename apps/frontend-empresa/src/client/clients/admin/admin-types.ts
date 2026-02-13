export type CreateEmpresaCommand = {
  nome: string
}

export type UpdateEmpresaCommand = {
  nome?: string
  status?: boolean
}

export type Empresa = {
  id: string
  nome: string
  slug: string
  status: boolean
  data_criacao: string
}

export type CleanUsuarioSenhaResponse = {
  message: string
}

// Tipos-Propriedade
export type CreateTipoPropriedadeCommand = {
  nome: string;
  descricao: string;
  empresaId?: string | null;
}

export type CreateTipoPropriedadeResult = {
  id: string;
}

export type UpdateTipoPropriedadeCommand = {
  nome: string;
  descricao: string;
  isAtivo: boolean;
}

export type UpdateTipoPropriedadeResult = {
  id: string;
}

export type TipoPropriedade = {
  id: string;
  nome: string;
  descricao: string;
  data_criacao: string
  empresa_id?: string | null;
  is_sistema: boolean;
  is_ativo: boolean;
}

// Usuários
export type CreateUsuarioCommand = {
  email: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  empresaIds?: string[] | null;
}

export type CreateUsuarioResult = {
  id: string;
}

export type UpdateUsuarioCommand = {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  empresaIds?: string[] | null;
}

export type UpdateUsuarioResult = {
  id: string;
}

export type Usuario = {
  id: string;
  email: string;
  dataCriacao: string;
  isSuperAdmin: boolean;
  empresa?: {
    id: string;
    slug: string;
    isAdmin: boolean;
    isAtivo: boolean;
  };
}
