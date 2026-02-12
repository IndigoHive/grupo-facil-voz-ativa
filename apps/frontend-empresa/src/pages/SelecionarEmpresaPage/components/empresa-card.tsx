import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { cn } from '../../../lib/utils'
import type { Empresa } from '../../../client/clients/authentication/authentication-types'

interface EmpresaCardProps {
  empresa: Empresa
  onSelect: () => Promise<void>
  isSelecting?: boolean
}

export function EmpresaCard({ empresa, onSelect, isSelecting }: EmpresaCardProps) {
  const handleClick = async () => {
    if (isSelecting) return

    await onSelect()
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
        isSelecting && 'opacity-50 cursor-not-allowed'
      )}
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="text-xl">{empresa.nome}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Clique para acessar
        </p>
      </CardContent>
    </Card>
  )
}
