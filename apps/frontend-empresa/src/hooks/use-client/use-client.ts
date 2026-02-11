import { ClientContext } from '../../contexts/client-context'
import { useContext } from 'react'

export function useClient () {
  return useContext(ClientContext)
}
