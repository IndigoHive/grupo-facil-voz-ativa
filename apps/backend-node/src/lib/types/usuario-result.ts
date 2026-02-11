import { Usuario } from '../../../generated/prisma/client'

export type UsuarioResult = Omit<Usuario, 'senha'>
