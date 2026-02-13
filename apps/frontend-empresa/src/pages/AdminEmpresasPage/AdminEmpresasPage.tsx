import { createColumnHelper } from '@tanstack/react-table'
import type { Empresa } from '../../client/clients/admin/admin-types'
import { FormattedDate } from '../../components/FormattedDate'
import { useAdminListEmpresas } from '../../hooks/fetch/use-admin-list-empresas'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { CreateEmpresaDialog, UpdateEmpresaDialog } from './components'
import { Button } from '../../components/ui/button'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip'

const columnHelper = createColumnHelper<Empresa>()

export function AdminEmpresasPage() {
  const [openEdit, setOpenEdit] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)

  const {
    data: empresas,
    isPending: isLoadingEmpresas,
    isError: isErrorLoadingEmpresas
  } = useAdminListEmpresas()

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setOpenEdit(true)
  }

  const columns = [
    columnHelper.accessor('nome', {
      header: () => 'Nome',
    }),
    columnHelper.accessor('slug', {
      header: () => 'Slug',
      cell: info => (
        <code className="bg-muted px-2 py-1 rounded text-sm">
          {info.getValue()}
        </code>
      )
    }),
    columnHelper.accessor('data_criacao', {
      header: () => 'Data de Criação',
      cell: info => <FormattedDate date={info.getValue()} />
    }),
    columnHelper.accessor('status', {
      header: () => 'Status',
      cell: info => {
        const status = info.getValue()
        return <Badge variant={status ? 'default' : 'destructive'}>{status ? 'Ativa' : 'Inativa'}</Badge>
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Ações',
      cell: info => {
        const empresa = info.row.original

        return (
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(empresa)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar empresa</p>
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
        <h1 className='text-2xl font-bold'>Empresas</h1>
        <CreateEmpresaDialog />
      </div>

      <UpdateEmpresaDialog
        empresa={editingEmpresa}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={empresas}
            isLoading={isLoadingEmpresas}
            isError={isErrorLoadingEmpresas}
          />
        </CardContent>
      </Card>
    </div>
  )
}
