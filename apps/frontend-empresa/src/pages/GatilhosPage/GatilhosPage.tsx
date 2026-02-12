import { createColumnHelper } from '@tanstack/react-table'
import type { Gatilho } from '../../client/clients/gatilhos/gatilhos-types'
import { useListGatilhos } from '../../hooks/fetch/use-list-gatilhos'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useState } from 'react'
import { Trash2, Pencil } from 'lucide-react'
import { useDeleteGatilho } from '../../hooks/fetch/use-delete-gatilho'
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip'
import { CreateGatilhoDialog, UpdateGatilhoDialog } from './components'

const columnHelper = createColumnHelper<Gatilho>()

export function GatilhosPage() {
  const [openEdit, setOpenEdit] = useState(false)
  const [editingGatilho, setEditingGatilho] = useState<Gatilho | null>(null)

  const {
    data: gatilhos,
    isPending: isLoadingGatilhos,
    isError: isErrorLoadingGatilhos
  } = useListGatilhos()

  const {
    mutate: deleteGatilho,
    isPending: isDeletingGatilho
  } = useDeleteGatilho()

  const handleEdit = (gatilho: Gatilho) => {
    setEditingGatilho(gatilho)
    setOpenEdit(true)
  }

  const columns = [
    columnHelper.accessor('descricao', {
      header: () => 'Descrição',
    }),
    columnHelper.accessor('destinatario', {
      header: () => 'Destinatário',
    }),
    columnHelper.accessor('tipo', {
      header: () => 'Tipo',
      cell: info => {
        const tipo = info.getValue()
        return (
          <Badge variant={tipo === 'email' ? 'default' : 'secondary'}>
            {tipo === 'email' ? 'E-mail' : 'WhatsApp'}
          </Badge>
        )
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Ações',
      cell: info => {
        const gatilho = info.row.original
        return (
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(gatilho)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar gatilho</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteGatilho(gatilho.id)}
                  disabled={isDeletingGatilho}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir gatilho</p>
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
        <h1 className='text-2xl font-bold'>Gatilhos</h1>
        <CreateGatilhoDialog />
      </div>

      <UpdateGatilhoDialog
        gatilho={editingGatilho}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={gatilhos}
            isLoading={isLoadingGatilhos}
            isError={isErrorLoadingGatilhos}
          />
        </CardContent>
      </Card>
    </div>
  )
}
