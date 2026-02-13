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
import { Textarea } from '../../../components/ui/textarea'
import { useAdminCreateTipoPropriedade } from '../../../hooks/fetch/use-admin-create-tipo-propriedade'
import type { CreateTipoPropriedadeCommand } from '../../../client/clients/admin/admin-types'

export function CreateTipoPropriedadeDialog() {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')

  const {
    mutate: createTipoPropriedade,
    isPending: isCreating
  } = useAdminCreateTipoPropriedade()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const command: CreateTipoPropriedadeCommand = {
      nome,
      descricao
    }

    createTipoPropriedade(command, {
      onSuccess: () => {
        setOpen(false)
        setNome('')
        setDescricao('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Tipo de Propriedade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Tipo de Propriedade</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar um novo tipo de propriedade.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Ex: Apartamento"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descrição do tipo de propriedade"
                value={descricao}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescricao(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Tipo de Propriedade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
