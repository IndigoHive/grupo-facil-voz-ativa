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
import { MultiSelect } from '../../../components/ui/multi-select'
import type { MultiSelectOption } from '../../../components/ui/multi-select'
import { useAdminUpdateUsuario } from '../../../hooks/fetch/use-admin-update-usuario'
import { useAdminListEmpresas } from '../../../hooks/fetch/use-admin-list-empresas'
import type { UpdateUsuarioCommand, ListUsuarioResult } from '../../../client/clients/admin/admin-types'

export type UpdateUsuarioDialogProps = {
  usuario: ListUsuarioResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateUsuarioDialog({ usuario, open, onOpenChange }: UpdateUsuarioDialogProps) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [selectedEmpresaIds, setSelectedEmpresaIds] = useState<string[]>([])

  const {
    mutate: updateUsuario,
    isPending: isUpdating
  } = useAdminUpdateUsuario()

  const {
    data: empresas,
    isPending: isLoadingEmpresas
  } = useAdminListEmpresas()

  const empresaOptions: MultiSelectOption[] = empresas?.map((empresa) => ({
    label: empresa.nome,
    value: empresa.id,
    description: empresa.slug
  })) || []

  useEffect(() => {
    if (open && usuario) {
      setIsSuperAdmin(usuario.isSuperAdmin)
      setSelectedEmpresaIds(usuario.empresas?.map(empresa => empresa.id) || [])
    }
  }, [open, usuario])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!usuario) return

    const command: UpdateUsuarioCommand = {
      isSuperAdmin,
      empresaIds: selectedEmpresaIds.length > 0 ? selectedEmpresaIds : null
    }

    updateUsuario({
      id: usuario.id,
      data: command
    }, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  const handleEmpresasChange = (values: string[]) => {
    setSelectedEmpresaIds(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={usuario?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                O email não pode ser editado.
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Empresas</Label>
              <MultiSelect
                options={empresaOptions}
                selected={selectedEmpresaIds}
                onChange={handleEmpresasChange}
                placeholder="Selecione as empresas..."
                emptyText="Nenhuma empresa disponível"
                disabled={isLoadingEmpresas}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="edit-isSuperAdmin"
                type="checkbox"
                checked={isSuperAdmin}
                onChange={(e) => setIsSuperAdmin(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isSuperAdmin" className="cursor-pointer">
                Super Admin (Acesso Total)
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
