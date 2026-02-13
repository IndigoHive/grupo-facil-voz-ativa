import { createColumnHelper } from '@tanstack/react-table'
import type { PropriedadeItem } from '../../client/clients/admin/admin-types'
import { FormattedDate } from '../../components/FormattedDate'
import { useAdminListPropriedadeItems } from '../../hooks/fetch/use-admin-list-propriedade-items'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { CreatePropriedadeItemDialog, UpdatePropriedadeItemDialog } from './components'
import { Button } from '../../components/ui/button'
import { useState } from 'react'
import { Pencil, ArrowLeft } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'

const columnHelper = createColumnHelper<PropriedadeItem>()

export function AdminPropriedadeItemPage() {
  const { idTipoPropriedade } = useParams<{ idTipoPropriedade: string }>()
  const navigate = useNavigate()
  const [openEdit, setOpenEdit] = useState(false)
  const [editingPropriedadeItem, setEditingPropriedadeItem] = useState<PropriedadeItem | null>(null)

  const {
    data: propriedadeItems,
    isPending: isLoadingPropriedadeItems,
    isError: isErrorLoadingPropriedadeItems
  } = useAdminListPropriedadeItems({ tipoPropriedadeId: idTipoPropriedade })

  const handleEdit = (propriedadeItem: PropriedadeItem) => {
    setEditingPropriedadeItem(propriedadeItem)
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
        const propriedadeItem = info.row.original

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEdit(propriedadeItem)}
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
        <div className='flex items-center gap-2'>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/propriedades')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className='text-2xl font-bold'>Itens de Propriedade</h1>
        </div>
        {idTipoPropriedade && <CreatePropriedadeItemDialog tipoPropriedadeId={idTipoPropriedade} />}
      </div>

      <UpdatePropriedadeItemDialog
        propriedadeItem={editingPropriedadeItem}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={propriedadeItems}
            isLoading={isLoadingPropriedadeItems}
            isError={isErrorLoadingPropriedadeItems}
          />
        </CardContent>
      </Card>
    </div>
  )
}
