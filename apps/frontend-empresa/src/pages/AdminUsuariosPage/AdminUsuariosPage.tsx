import { createColumnHelper } from '@tanstack/react-table'
import type { ListUsuarioResult } from '../../client/clients/admin/admin-types'
import { FormattedDate } from '../../components/FormattedDate'
import { useAdminListUsuarios } from '../../hooks/fetch/use-admin-list-usuarios'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { CreateUsuarioDialog, UpdateUsuarioDialog } from './components'
import { Button } from '../../components/ui/button'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip'

const columnHelper = createColumnHelper<ListUsuarioResult>()

export function AdminUsuariosPage() {
  const [openEdit, setOpenEdit] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<ListUsuarioResult | null>(null)

  const {
    data: usuarios,
    isPending: isLoadingUsuarios,
    isError: isErrorLoadingUsuarios
  } = useAdminListUsuarios()

  const handleEdit = (usuario: ListUsuarioResult) => {
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
    columnHelper.accessor('isSuperAdmin', {
      header: () => 'Super Admin',
      cell: info => {
        const isSuperAdmin = info.getValue()
        return <Badge variant={isSuperAdmin ? 'default' : 'secondary'}>{isSuperAdmin ? 'Sim' : 'Não'}</Badge>
      }
    }),
    columnHelper.accessor('empresas', {
      header: () => 'Empresas',
      cell: info => {
        const empresas = info.getValue()
        if (!empresas) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex flex-col gap-1">
            {empresas.map(empresa => (
              <code key={empresa.id} className="bg-muted px-2 py-1 rounded text-sm">
                {empresa.slug} - {empresa.isAtivo ? 'Ativo' : 'Inativo'} - {empresa.isAdmin ? '(Admin)' : 'Usuário'}
              </code>
            ))}
          </div>
        )
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
