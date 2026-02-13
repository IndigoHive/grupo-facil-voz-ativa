import { createColumnHelper } from '@tanstack/react-table'
import type { TipoPropriedade } from '../../client/clients/admin/admin-types'
import { FormattedDate } from '../../components/FormattedDate'
import { useAdminListTipoPropriedade } from '../../hooks/fetch/use-admin-list-tipo-propriedade'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { CreateTipoPropriedadeDialog, UpdateTipoPropriedadeDialog } from './components'
import { Button } from '../../components/ui/button'
import { useState } from 'react'
import { Pencil } from 'lucide-react'

const columnHelper = createColumnHelper<TipoPropriedade>()

export function AdminTipoPropriedadePage() {
  const [openEdit, setOpenEdit] = useState(false)
  const [editingTipoPropriedade, setEditingTipoPropriedade] = useState<TipoPropriedade | null>(null)

  const {
    data: tiposPropriedade,
    isPending: isLoadingTiposPropriedade,
    isError: isErrorLoadingTiposPropriedade
  } = useAdminListTipoPropriedade()

  const handleEdit = (tipoPropriedade: TipoPropriedade) => {
    setEditingTipoPropriedade(tipoPropriedade)
    setOpenEdit(true)
  }

  const columns = [
    columnHelper.accessor('nome', {
      header: () => 'Nome',
    }),
    columnHelper.accessor('descricao', {
      header: () => 'Descrição',
    }),
    columnHelper.accessor('data_criacao', {
      header: () => 'Data de Criação',
      cell: info => <FormattedDate date={info.getValue()} />
    }),
    columnHelper.accessor('is_sistema', {
      header: () => 'Sistema',
      cell: info => {
        const isSistema = info.getValue()
        return <Badge variant={isSistema ? 'default' : 'secondary'}>{isSistema ? 'Sim' : 'Não'}</Badge>
      }
    }),
    columnHelper.accessor('is_ativo', {
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
        const tipoPropriedade = info.row.original

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(tipoPropriedade)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    })
  ]

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Propriedades</h1>
        <CreateTipoPropriedadeDialog />
      </div>

      <UpdateTipoPropriedadeDialog
        tipoPropriedade={editingTipoPropriedade}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={tiposPropriedade}
            isLoading={isLoadingTiposPropriedade}
            isError={isErrorLoadingTiposPropriedade}
          />
        </CardContent>
      </Card>
    </div>
  )
}
