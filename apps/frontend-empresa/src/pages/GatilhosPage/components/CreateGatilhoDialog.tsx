import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { CreateGatilhoCommand } from '../../../client/clients/gatilhos/gatilhos-types'
import { useCreateGatilho } from '../../../hooks/fetch/use-create-gatilho'

export function CreateGatilhoDialog() {
  const [open, setOpen] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [destinatario, setDestinatario] = useState('')
  const [tipo, setTipo] = useState<'email' | 'whatsapp'>('email')

  const {
    mutate: createGatilho,
    isPending: isCreatingGatilho
  } = useCreateGatilho()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const command: CreateGatilhoCommand = {
      descricao,
      destinatario,
      tipo
    }

    createGatilho(command, {
      onSuccess: () => {
        setOpen(false)
        setDescricao('')
        setDestinatario('')
        setTipo('email')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Criar Gatilho
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Gatilho</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para criar um novo gatilho.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                type="text"
                placeholder="Descrição do gatilho"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Tipo</Label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    id="tipo-email"
                    type="radio"
                    name="tipo"
                    value="email"
                    checked={tipo === 'email'}
                    onChange={(e) => setTipo(e.target.value as 'email' | 'whatsapp')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="tipo-email" className="cursor-pointer font-normal">
                    E-mail
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="tipo-whatsapp"
                    type="radio"
                    name="tipo"
                    value="whatsapp"
                    checked={tipo === 'whatsapp'}
                    onChange={(e) => setTipo(e.target.value as 'email' | 'whatsapp')}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="tipo-whatsapp" className="cursor-pointer font-normal">
                    WhatsApp
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="destinatario">
                {tipo === 'email' ? 'E-mail' : 'Número de WhatsApp'}
              </Label>
              <Input
                id="destinatario"
                type={tipo === 'email' ? 'email' : 'tel'}
                placeholder={tipo === 'email' ? 'exemplo@email.com' : '+5511999999999'}
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreatingGatilho}>
              {isCreatingGatilho ? 'Criando...' : 'Criar Gatilho'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
