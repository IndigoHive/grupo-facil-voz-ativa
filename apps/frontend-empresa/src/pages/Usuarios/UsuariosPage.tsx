import { createColumnHelper } from '@tanstack/react-table'
import type { UsuarioResult } from '../../client/types/usuario-result'
import { FormattedDate } from '../../components/FormattedDate'
import { useListUsuarios } from '../../hooks/fetch/use-list-usuarios'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { useCreateUsuario } from '../../hooks/fetch/use-create-usuario'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { CreateUsuarioCommand } from '../../client/clients/usuarios/usuarios-types'

const columnHelper = createColumnHelper<UsuarioResult>()

const columns = [
  columnHelper.accessor('email', {
    header: () => 'Email',
  }),
  columnHelper.accessor('dataCriacao', {
    header: () => 'Data de Criação',
    cell: info => <FormattedDate date={info.getValue()} />
  }),
  columnHelper.accessor(row => row.empresa?.isAdmin, {
    id: 'isAdmin',
    header: () => 'Admin',
    cell: info => {
      const isAdmin = info.getValue()
      return <Badge variant={isAdmin ? 'default' : 'destructive'}>{isAdmin ? 'Sim' : 'Não'}</Badge>
    }
  })
]

export function UsuariosPage () {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const {
    data: usuarios,
    isPending: isLoadingUsuarios,
    isError: isErrorLoadingUsuarios
  } = useListUsuarios()

  const {
    mutate: createUsuario,
    isPending: isCreatingUsuario
  } = useCreateUsuario()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const command: CreateUsuarioCommand = {
      email,
      isAdmin
    }

    createUsuario(command, {
      onSuccess: () => {
        setOpen(false)
        setEmail('')
        setIsAdmin(false)
      }
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Usuários</h1>

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
                <div className="flex items-center gap-2">
                  <input
                    id="isAdmin"
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isAdmin" className="cursor-pointer">
                    Admin da Empresa
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreatingUsuario}>
                  {isCreatingUsuario ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={usuarios}
            isLoading={isLoadingUsuarios}
            isError={isErrorLoadingUsuarios}
          />
        </CardContent>
      </Card>
    </div>
  )
}
