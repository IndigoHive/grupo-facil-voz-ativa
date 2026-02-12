import { FormattedDate } from './FormattedDate'

export default {
  title: 'Components/FormattedDate'
}

export const Examples = () => {
  return (
    <div className="flex flex-col gap-2">
      <FormattedDate date={new Date()} />
      <FormattedDate date="2025-11-15T20:18:19.450Z" />
      <FormattedDate date={1763237907131} />
      <FormattedDate date={null} />
      <FormattedDate date="XYZ" />
    </div>
  )
}
