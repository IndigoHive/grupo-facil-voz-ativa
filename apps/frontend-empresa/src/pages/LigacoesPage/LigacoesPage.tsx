import { useMemo, useRef, useCallback, useEffect } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useLigacoesPage } from '../../hooks/fetch/use-ligacoes-page'
import { Card, CardContent } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import type { Ligacao } from '../../client/clients/ligacoes/ligacoes-types'
import { FormattedDate } from '../../components/FormattedDate'

const columnHelper = createColumnHelper<Ligacao>()

// Simple styles for column resizing
const resizerStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 0,
  height: '100%',
  width: '5px',
  background: 'rgba(0,0,0,0.5)',
  cursor: 'col-resize',
  userSelect: 'none',
  touchAction: 'none',
  zIndex: 1,
}

const resizerActiveStyle: React.CSSProperties = {
  ...resizerStyle,
  background: 'rgba(59, 130, 246, 0.8)',
  width: '3px',
}

export function LigacoesPage () {
  const {
    data,
    isPending,
    isError
  } = useLigacoesPage()

  // Referências para drag to scroll
  const tableRef = useRef<HTMLTableElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeftStart = useRef(0)
  const isDragScrolling = useRef(false)

  // Coletar todas as propriedades únicas de todas as ligações
  const todasPropriedades = useMemo(() => {
    if (!data?.data) return []

    const propriedadesSet = new Set<string>()

    data.data.forEach(ligacao => {
      ligacao.propriedades.forEach(prop => {
        propriedadesSet.add(JSON.stringify({ id: prop.id, nome: prop.nome }))
      })
    })

    return Array.from(propriedadesSet).map(str => JSON.parse(str))
  }, [data])

  // Criar colunas dinamicamente
  const columns = useMemo(() => {
    const fixedColumns = [
      columnHelper.accessor('id_unico', {
        header: () => 'ID Único',
        cell: info => info.getValue() || '-',
        size: 150,
      }),
      columnHelper.accessor('data_criacao', {
        header: () => 'Data',
        cell: info => <FormattedDate date={info.getValue()} />,
        size: 120,
      }),
      columnHelper.accessor('nome_cliente', {
        header: () => 'Cliente',
        cell: info => info.getValue() || '-',
        size: 150,
      }),
      columnHelper.accessor('nome_agente', {
        header: () => 'Agente',
        cell: info => info.getValue() || '-',
        size: 150,
      }),
      columnHelper.accessor('status_resolucao', {
        header: () => 'Status',
        cell: info => info.getValue() || '-',
        size: 120,
      }),
      columnHelper.accessor('duracao_ligacao', {
        header: () => 'Duração (s)',
        cell: info => {
          const duracao = info.getValue()
          return duracao ? `${duracao}s` : '-'
        },
        size: 120,
      }),
    ]

    // Criar colunas dinâmicas para cada propriedade
    const dynamicColumns = todasPropriedades.map(propriedade =>
      columnHelper.display({
        id: `prop-${propriedade.id}`,
        header: () => propriedade.nome,
        cell: info => {
          const ligacao = info.row.original
          const prop = ligacao.propriedades.find(p => p.id === propriedade.id)

          if (!prop || prop.itens.length === 0) return '-'

          // Se tiver apenas um item, mostrar direto
          if (prop.itens.length === 1) {
            return prop.itens[0].nome
          }

          // Se tiver múltiplos itens, mostrar lista separada por vírgula
          return prop.itens.map(item => item.nome).join(', ')
        },
        size: 200,
      })
    )

    return [...fixedColumns, ...dynamicColumns]
  }, [todasPropriedades])

  // Configurar a tabela com resizing
  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50,
      maxSize: 800,
    },
  })

  // Handlers para drag to scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    // Ignore interactive elements or resizers
    if (target.closest('button') || target.closest('.resizer') || target.closest('input') || target.closest('select')) {
      return
    }

    // Check if the event target or any parent has the resizer class
    if (target.classList.contains('resizer') || target.closest('.resizer')) {
      return
    }

    if (!tableRef.current) return
    const slider = tableRef.current.parentElement
    if (!slider) return

    isDragging.current = true
    isDragScrolling.current = false
    startX.current = e.pageX - slider.offsetLeft
    scrollLeftStart.current = slider.scrollLeft

    slider.style.cursor = 'grabbing'
    slider.style.userSelect = 'none'
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    if (tableRef.current?.parentElement) {
      const slider = tableRef.current.parentElement
      slider.style.cursor = 'grab'
      slider.style.removeProperty('user-select')
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    if (tableRef.current?.parentElement) {
      const slider = tableRef.current.parentElement
      slider.style.cursor = 'grab'
      slider.style.removeProperty('user-select')
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return

    e.preventDefault()

    if (!tableRef.current) return
    const slider = tableRef.current.parentElement
    if (!slider) return

    const x = e.pageX - slider.offsetLeft
    const walk = (x - startX.current)

    if (Math.abs(walk) > 5) {
      isDragScrolling.current = true
    }

    slider.scrollLeft = scrollLeftStart.current - walk
  }, [])

  const handleTableClickCapture = useCallback((e: React.MouseEvent) => {
    if (isDragScrolling.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  useEffect(() => {
    if (tableRef.current?.parentElement) {
      tableRef.current.parentElement.style.cursor = 'grab'
    }
  }, [])

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Ligações</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div
            className="overflow-x-auto"
            style={{ cursor: 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <table
              ref={tableRef}
              onClickCapture={handleTableClickCapture}
              className="w-full caption-bottom text-sm"
              style={{
                width: table.getTotalSize(),
                tableLayout: 'fixed'
              }}
            >
              <thead className="[&_tr]:border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="h-10 px-2 text-left align-middle font-medium text-foreground whitespace-nowrap"
                        style={{
                          width: header.getSize(),
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            const handler = header.getResizeHandler()
                            handler(e)
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation()
                            const handler = header.getResizeHandler()
                            handler(e)
                          }}
                          className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
                          style={header.column.getIsResizing() ? resizerActiveStyle : resizerStyle}
                        />
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isError && (
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td colSpan={table.getAllColumns().length} className="p-2 align-middle text-left">
                      <p className='text-red-400'>Erro ao carregar resultados</p>
                    </td>
                  </tr>
                )}
                {isPending && (
                  <>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                        {table.getAllColumns().map(column => (
                          <td key={column.id} className="p-2 align-middle whitespace-nowrap">
                            <Skeleton className='w-full h-6' />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}
                {!table.getRowModel().rows?.length && !isPending && !isError && (
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <td colSpan={table.getAllColumns().length} className="p-2 align-middle text-left">
                      Nenhum resultado encontrado.
                    </td>
                  </tr>
                )}
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="p-2 align-middle whitespace-nowrap"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
