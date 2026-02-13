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
import { useAdminCreateEmpresa } from '../../../hooks/fetch/use-admin-create-empresa'
import type { CreateEmpresaCommand } from '../../../client/clients/admin/admin-types'

export function CreateEmpresaDialog() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')

  const {
    mutate: createEmpresa,
    isPending: isCreating
  } = useAdminCreateEmpresa()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const command: CreateEmpresaCommand = {
      nome
    }

    createEmpresa(command, {
      onSuccess: () => {
        setOpen(false)
        setNome('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Empresa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Empresa</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar uma nova empresa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Empresa</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Ex: Empresa ABC"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Empresa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
