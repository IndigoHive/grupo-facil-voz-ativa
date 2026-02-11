import { Usuario } from '@voz-ativa/database'


export type UsuarioResult = Omit<Usuario, 'senha'> & {
  empresa_slug: string
}
