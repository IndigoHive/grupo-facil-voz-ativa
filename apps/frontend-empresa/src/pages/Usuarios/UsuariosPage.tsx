import { createColumnHelper } from '@tanstack/react-table'
import type { UsuarioResult } from '../../client/types/usuario-result'
import { FormattedDate } from '../../components/FormattedDate'
import { useListUsuarios } from '../../hooks/fetch/use-list-usuarios'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip'
import { CreateUsuarioDialog, UpdateUsuarioDialog } from './components'

const columnHelper = createColumnHelper<UsuarioResult>()

export function UsuariosPage () {
  const [openEdit, setOpenEdit] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<UsuarioResult | null>(null)

  const {
    data: usuarios,
    isPending: isLoadingUsuarios,
    isError: isErrorLoadingUsuarios
  } = useListUsuarios()

  const handleEdit = (usuario: UsuarioResult) => {
    setEditingUsuario(usuario)
    setOpenEdit(true)
  }

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
    }),
    columnHelper.accessor(row => row.empresa?.isAtivo, {
      id: 'isAtivo',
      header: () => 'Ativo',
      cell: info => {
        const isAtivo = info.getValue()
        return <Badge variant={isAtivo ? 'default' : 'destructive'}>{isAtivo ? 'Sim' : 'Não'}</Badge>
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Ações',
      cell: info => {
        const usuario = info.row.original
        return (
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(usuario)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar usuário</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      }
    })
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Usuários</h1>
        <CreateUsuarioDialog />
      </div>

      <UpdateUsuarioDialog
        usuario={editingUsuario}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

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
