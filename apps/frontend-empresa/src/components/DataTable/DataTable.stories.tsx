import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './DataTable'

export default {
  title: 'Components/DataTable'
}

type Row = {
  id: number
  name: string
}

const columns: ColumnDef<Row>[] = [
  {
    header: 'Id',
    accessorKey: 'id'
  },
  {
    header: 'Name',
    accessorKey: 'name'
  }
]

export const Example = () => {
  return (
    <DataTable<Row>
      data={[
        { id: 1, name: 'Example Name' },
        { id: 2, name: 'Another Name' }
      ]}
      columns={columns}
    />
  )
}
