import { useEffect } from 'react'
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
import { Textarea } from '../../../components/ui/textarea'
import { useAdminUpdateTipoPropriedade } from '../../../hooks/fetch/use-admin-update-tipo-propriedade'
import type { TipoPropriedade, UpdateTipoPropriedadeCommand } from '../../../client/clients/admin/admin-types'
import { useState } from 'react'

export type UpdateTipoPropriedadeDialogProps = {
  tipoPropriedade: TipoPropriedade | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateTipoPropriedadeDialog({ tipoPropriedade, open, onOpenChange }: UpdateTipoPropriedadeDialogProps) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [isAtivo, setIsAtivo] = useState(true)

  const {
    mutate: updateTipoPropriedade,
    isPending: isUpdating
  } = useAdminUpdateTipoPropriedade()

  useEffect(() => {
    if (open && tipoPropriedade) {
      setNome(tipoPropriedade.nome)
      setDescricao(tipoPropriedade.descricao)
      setIsAtivo(tipoPropriedade.is_ativo)
    }
  }, [open, tipoPropriedade])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!tipoPropriedade) return

    const command: UpdateTipoPropriedadeCommand = {
      nome,
      descricao,
      isAtivo
    }

    updateTipoPropriedade({
      id: tipoPropriedade.id,
      data: command
    }, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  const isSistema = tipoPropriedade?.is_sistema ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Tipo de Propriedade</DialogTitle>
          <DialogDescription>
            Atualize as informações do tipo de propriedade.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input
                id="edit-nome"
                type="text"
                placeholder="Ex: Apartamento"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                placeholder="Descrição do tipo de propriedade"
                value={descricao}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescricao(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-isAtivo"
                type="checkbox"
                checked={isAtivo}
                onChange={(e) => setIsAtivo(e.target.checked)}
                className="h-4 w-4"
                disabled={isSistema}
              />
              <Label htmlFor="edit-isAtivo" className="cursor-pointer">
                Ativo
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
