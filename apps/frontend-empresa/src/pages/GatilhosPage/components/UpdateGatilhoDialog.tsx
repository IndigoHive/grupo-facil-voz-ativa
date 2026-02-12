import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { useEffect, useState } from 'react'
import type { Gatilho, UpdateGatilhoCommand } from '../../../client/clients/gatilhos/gatilhos-types'
import { useUpdateGatilho } from '../../../hooks/fetch/use-update-gatilho'

interface UpdateGatilhoDialogProps {
  gatilho: Gatilho | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateGatilhoDialog({ gatilho, open, onOpenChange }: UpdateGatilhoDialogProps) {
  const [descricao, setDescricao] = useState('')

  const {
    mutate: updateGatilho,
    isPending: isUpdatingGatilho
  } = useUpdateGatilho()

  useEffect(() => {
    if (gatilho) {
      setDescricao(gatilho.descricao)
    }
  }, [gatilho])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!gatilho) return

    const command: UpdateGatilhoCommand = {
      descricao
    }

    updateGatilho({ id: gatilho.id, data: command }, {
      onSuccess: () => {
        onOpenChange(false)
        setDescricao('')
      }
    })
  }

  const handleCancel = () => {
    onOpenChange(false)
    setDescricao('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Gatilho</DialogTitle>
          <DialogDescription>
            Atualize a descrição do gatilho.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Input
                id="edit-descricao"
                type="text"
                placeholder="Descrição do gatilho"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdatingGatilho}>
              {isUpdatingGatilho ? 'Atualizando...' : 'Atualizar Gatilho'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
