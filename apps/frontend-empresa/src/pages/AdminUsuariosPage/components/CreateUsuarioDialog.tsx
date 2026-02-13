import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { MultiSelect } from '../../../components/ui/multi-select'
import type { MultiSelectOption } from '../../../components/ui/multi-select'
import { useAdminCreateUsuario } from '../../../hooks/fetch/use-admin-create-usuario'
import { useAdminListEmpresas } from '../../../hooks/fetch/use-admin-list-empresas'
import type { CreateUsuarioCommand } from '../../../client/clients/admin/admin-types'

export function CreateUsuarioDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [selectedEmpresaIds, setSelectedEmpresaIds] = useState<string[]>([])

  const {
    mutate: createUsuario,
    isPending: isCreating
  } = useAdminCreateUsuario()

  const {
    data: empresas,
    isPending: isLoadingEmpresas
  } = useAdminListEmpresas()

  const empresaOptions: MultiSelectOption[] = empresas?.map((empresa) => ({
    label: empresa.nome,
    value: empresa.id,
    description: empresa.slug
  })) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const command: CreateUsuarioCommand = {
      email,
      isSuperAdmin,
      empresaIds: selectedEmpresaIds.length > 0 ? selectedEmpresaIds : null
    }

    createUsuario(command, {
      onSuccess: () => {
        setOpen(false)
        setEmail('')
        setIsSuperAdmin(false)
        setSelectedEmpresaIds([])
      }
    })
  }

  const handleEmpresasChange = (values: string[]) => {
    setSelectedEmpresaIds(values)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar um novo usuário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                id="isSuperAdmin"
                type="checkbox"
                checked={isSuperAdmin}
                onChange={(e) => setIsSuperAdmin(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isSuperAdmin" className="cursor-pointer">
                Super Admin (Acesso Total)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
