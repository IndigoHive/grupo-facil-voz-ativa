/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type VisibilityState
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Skeleton } from '../ui/skeleton'

export type DataTableProps<T> = {
  data?: T[]
  columns: ColumnDef<T, any>[]
  isLoading?: boolean
  isError?: boolean
  columnVisibility?: VisibilityState
}

export function DataTable<T> (props: DataTableProps<T>) {
  const { data = [], columns, isLoading, isError, columnVisibility } = props

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnVisibility
    }
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isError && (
          <TableRow>
            <TableCell colSpan={table.getAllColumns().length} className="text-left">
              <p className='text-red-400'>Erro ao carregar resultados</p>
            </TableCell>
          </TableRow>
        )}
        {isLoading && (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {table.getAllColumns().map(column => (
                  <TableCell key={column.id} colSpan={1} className="text-center">
                    <Skeleton
                      className='w-full h-6'
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </>
        )}
        {!table.getRowModel().rows?.length && !isLoading && !isError && (
          <TableRow>
            <TableCell colSpan={table.getAllColumns().length} className="text-left">
              Nenhum resultado encontrado.
            </TableCell>
          </TableRow>
        )}
        {table.getRowModel().rows && table.getRowModel().rows.length > 0 && table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
