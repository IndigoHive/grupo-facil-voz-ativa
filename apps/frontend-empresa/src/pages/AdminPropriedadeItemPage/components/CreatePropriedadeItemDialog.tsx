import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useState } from 'react'
import { useAdminCreatePropriedadeItem } from '../../../hooks/fetch/use-admin-create-propriedade-item'
import { Textarea } from '../../../components/ui/textarea'
import { Plus } from 'lucide-react'

type CreatePropriedadeItemDialogProps = {
  tipoPropriedadeId: string
}

export function CreatePropriedadeItemDialog({ tipoPropriedadeId }: CreatePropriedadeItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')

  const { mutate: createPropriedadeItem, isPending } = useAdminCreatePropriedadeItem()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPropriedadeItem(
      {
        tipoPropriedadeId,
        nome,
        descricao
      },
      {
        onSuccess: () => {
          setOpen(false)
          setNome('')
          setDescricao('')
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Criar Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Item de Propriedade</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar um novo item de propriedade.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome do item"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Digite a descrição do item"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
