import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useEffect, useState } from 'react'
import { useAdminUpdatePropriedadeItem } from '../../../hooks/fetch/use-admin-update-propriedade-item'
import { Textarea } from '../../../components/ui/textarea'
import type { PropriedadeItem } from '../../../client/clients/admin/admin-types'

type UpdatePropriedadeItemDialogProps = {
  propriedadeItem: PropriedadeItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdatePropriedadeItemDialog({ propriedadeItem, open, onOpenChange }: UpdatePropriedadeItemDialogProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [isAtivo, setIsAtivo] = useState(true)

  const { mutate: updatePropriedadeItem, isPending } = useAdminUpdatePropriedadeItem()

  useEffect(() => {
    if (propriedadeItem) {
      setNome(propriedadeItem.nome)
      setDescricao(propriedadeItem.descricao)
      setIsAtivo(propriedadeItem.is_ativo)
    }
  }, [propriedadeItem])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!propriedadeItem) return

    updatePropriedadeItem(
      {
        id: propriedadeItem.id,
        data: {
          nome,
          descricao,
          isAtivo
        }
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Item de Propriedade</DialogTitle>
            <DialogDescription>
              Atualize os campos abaixo para editar o item de propriedade.
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAtivo"
                checked={isAtivo}
                onChange={(e) => setIsAtivo(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isAtivo">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
