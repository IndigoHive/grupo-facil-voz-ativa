import { createColumnHelper } from '@tanstack/react-table'
import type { ChaveApi } from '../../client/clients/chaves-api/chaves-api-types'
import { FormattedDate } from '../../components/FormattedDate'
import { useListChavesApi } from '../../hooks/fetch/use-list-chaves-api'
import { DataTable } from '../../components/DataTable'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { useCreateChaveApi } from '../../hooks/fetch/use-create-chave-api'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useState } from 'react'
import { Plus, KeyRound, Copy, X } from 'lucide-react'
import type { CreateChaveApiCommand } from '../../client/clients/chaves-api/chaves-api-types'
import { useRevokeChaveApi } from '../../hooks/fetch/use-revoke-chave-api'
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip'
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert'

const columnHelper = createColumnHelper<ChaveApi>()

export function ChavesApiPage () {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)

  const {
    data: chavesApi,
    isPending: isLoadingChavesApi,
    isError: isErrorLoadingChavesApi
  } = useListChavesApi()

  const {
    mutate: createChaveApi,
    isPending: isCreatingChaveApi
  } = useCreateChaveApi()

  const {
    mutate: revokeChaveApi,
    isPending: isRevokingChaveApi
  } = useRevokeChaveApi()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const command: CreateChaveApiCommand = {
      nome
    }

    createChaveApi(command, {
      onSuccess: (data) => {
        setOpen(false)
        setNome('')
        setCreatedApiKey(data.id)
      }
    })
  }

  const handleCopyApiKey = () => {
    if (createdApiKey) {
      navigator.clipboard.writeText(createdApiKey)
    }
  }

  const columns = [
    columnHelper.accessor('chave_ultimos_digitos', {
      header: () => 'Últimos Dígitos',
      cell: info => <span className="font-mono">****{info.getValue()}</span>
    }),
    columnHelper.accessor('data_criacao', {
      header: () => 'Data de Criação',
      cell: info => <FormattedDate date={info.getValue()} />
    }),
    columnHelper.accessor('data_revogacao', {
      header: () => 'Status',
      cell: info => {
        const dataRevogacao = info.getValue()
        return (
          <Badge variant={dataRevogacao ? 'destructive' : 'default'}>
            {dataRevogacao ? 'Revogada' : 'Ativa'}
          </Badge>
        )
      }
    }),
    columnHelper.accessor('data_revogacao', {
      id: 'data_revogacao_display',
      header: () => 'Data de Revogação',
      cell: info => {
        const dataRevogacao = info.getValue()
        return dataRevogacao ? <FormattedDate date={dataRevogacao} /> : '-'
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Ações',
      cell: info => {
        const chaveId = info.row.original.id
        const isRevogada = info.row.original.data_revogacao !== null
        return (
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => revokeChaveApi(chaveId)}
                  disabled={isRevokingChaveApi || isRevogada}
                >
                  <KeyRound />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Revogar chave API</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      }
    })
  ]

  return (
    <div className='flex flex-col gap-4'>
      {createdApiKey && (
        <Alert className="relative border-yellow-600 bg-yellow-50 dark:border-yellow-500 dark:bg-yellow-900/20">
          <button
            onClick={() => setCreatedApiKey(null)}
            className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
          <KeyRound className="text-yellow-600 dark:text-yellow-500" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-500">
            Chave API Criada com Sucesso!
          </AlertTitle>
          <AlertDescription className="space-y-2 text-yellow-700 dark:text-yellow-400">
            <p>
              Por motivos de segurança, esta chave só será exibida uma única vez.
              Copie e armazene em um local seguro.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-yellow-100 dark:bg-yellow-900/40 px-3 py-2 text-sm font-mono text-yellow-900 dark:text-yellow-300 break-all">
                {createdApiKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyApiKey}
                className="shrink-0"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Chaves API</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Chave API
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Chave API</DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para criar uma nova chave API.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Nome da chave API"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreatingChaveApi}>
                  {isCreatingChaveApi ? 'Criando...' : 'Criar Chave API'}
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
            data={chavesApi}
            isLoading={isLoadingChavesApi}
            isError={isErrorLoadingChavesApi}
          />
        </CardContent>
      </Card>
    </div>
  )
}
