import { ForbiddenError } from './errors'
import { UsuarioResult } from './types/usuario-result'

export function validateIsAdminOrSuperAdmin(authenticatedUsuario: UsuarioResult) {
  if (!authenticatedUsuario.empresa?.isAdmin && !authenticatedUsuario.isSuperAdmin) {
    throw new ForbiddenError('Apenas administradores podem realizar esta ação');
  }
}
