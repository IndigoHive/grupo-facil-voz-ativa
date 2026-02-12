import { ptBR } from 'date-fns/locale'
import { formatDate } from 'date-fns/format'
import { isValid } from 'date-fns/isValid'
import clsx from 'clsx'

export type FormattedDateProps = {
  className?: string
  date: Date | string | number | null
  format?: string
  placeholder?: string
}

const DEFAULT_FORMAT = 'Ppp'

export function FormattedDate (props: FormattedDateProps) {
  const { className, date, format = DEFAULT_FORMAT, placeholder = 'null' } = props

  let formatted = placeholder

  if (date !== null) {
    const parsedDate = new Date(date)

    if (isValid(parsedDate)) {
      formatted = formatDate(new Date(date), format, { locale: ptBR })
    } else {
      formatted = 'Data inválida'
    }
  }

  return (
    <span
      className={clsx(
        'whitespace-nowrap',
        date === null && 'italic text-muted-foreground',
        className
      )}
    >
      {formatted}
    </span>
  )
}
