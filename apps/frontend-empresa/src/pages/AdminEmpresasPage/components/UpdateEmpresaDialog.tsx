import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useAdminUpdateEmpresa } from '../../../hooks/fetch/use-admin-update-empresa'
import type { Empresa, UpdateEmpresaCommand } from '../../../client/clients/admin/admin-types'

export type UpdateEmpresaDialogProps = {
  empresa: Empresa | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateEmpresaDialog({ empresa, open, onOpenChange }: UpdateEmpresaDialogProps) {
  const [nome, setNome] = useState('')
  const [status, setStatus] = useState(true)

  const {
    mutate: updateEmpresa,
    isPending: isUpdating
  } = useAdminUpdateEmpresa()

  useEffect(() => {
    if (open && empresa) {
      setNome(empresa.nome)
      setStatus(empresa.status)
    }
  }, [open, empresa])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!empresa) return

    const command: UpdateEmpresaCommand = {
      nome,
      status
    }

    updateEmpresa({
      id: empresa.id,
      data: command
    }, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>
            Atualize as informações da empresa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nome">Nome da Empresa</Label>
              <Input
                id="edit-nome"
                type="text"
                placeholder="Ex: Empresa ABC"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                type="text"
                value={empresa?.slug || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                O slug é gerado automaticamente e não pode ser editado.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-status"
                type="checkbox"
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-status" className="cursor-pointer">
                Ativa
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
