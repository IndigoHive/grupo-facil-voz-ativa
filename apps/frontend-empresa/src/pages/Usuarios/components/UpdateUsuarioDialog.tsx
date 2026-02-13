import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { useEffect, useState } from 'react'
import type { UsuarioResult } from '../../../client/types/usuario-result'
import type { UpdateUsuarioCommand } from '../../../client/clients/usuarios/usuarios-types'
import { useUpdateUsuario } from '../../../hooks/fetch/use-update-usuario'

interface UpdateUsuarioDialogProps {
  usuario: UsuarioResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateUsuarioDialog({ usuario, open, onOpenChange }: UpdateUsuarioDialogProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAtivo, setIsAtivo] = useState(false)

  const {
    mutate: updateUsuario,
    isPending: isUpdatingUsuario
  } = useUpdateUsuario()

  useEffect(() => {
    if (usuario) {
      setIsAdmin(usuario.empresa?.isAdmin ?? false)
      setIsAtivo(usuario.empresa?.isAtivo ?? false)
    }
  }, [usuario])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!usuario) return

    const command: UpdateUsuarioCommand = {
      isAdmin,
      isAtivo
    }

    updateUsuario({ id: usuario.id, data: command }, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  const handleCancel = () => {
    onOpenChange(false)
    if (usuario) {
      setIsAdmin(usuario.empresa?.isAdmin ?? false)
      setIsAtivo(usuario.empresa?.isAtivo ?? false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as permissões e status do usuário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-sm font-medium">{usuario?.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="edit-isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isAdmin" className="cursor-pointer">
                Admin da Empresa
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="edit-isAtivo"
                type="checkbox"
                checked={isAtivo}
                onChange={(e) => setIsAtivo(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isAtivo" className="cursor-pointer">
                Ativo
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdatingUsuario}>
              {isUpdatingUsuario ? 'Atualizando...' : 'Atualizar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
