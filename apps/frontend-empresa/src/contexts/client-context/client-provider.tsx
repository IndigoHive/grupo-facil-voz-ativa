import { Client } from '../../client'
import type { PropsWithChildren } from 'react'
import { ClientContext } from './client-context'

export type ClientProviderProps = PropsWithChildren<{
  client: Client
}>

export function ClientProvider (props: ClientProviderProps) {
  return (
    <ClientContext.Provider value={props.client}>
      {props.children}
    </ClientContext.Provider>
  )
}
