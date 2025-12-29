import { Connection, type ConnectionConfig } from '@trezoa/web3.js'
import React, { createContext, type ReactNode, useContext, useMemo } from 'react'
import { useCluster } from '../cluster/cluster-provider'

export interface TrezoaProviderState {
  connection: Connection
}

export interface TrezoaProviderProps {
  children: ReactNode
  config?: ConnectionConfig
}

const ConnectionContext = createContext<TrezoaProviderState>({} as TrezoaProviderState)

export function TrezoaProvider({ children, config = { commitment: 'confirmed' } }: TrezoaProviderProps) {
  const { selectedCluster } = useCluster()
  const connection = useMemo(() => new Connection(selectedCluster.endpoint, config), [selectedCluster, config])

  return <ConnectionContext.Provider value={{ connection }}>{children}</ConnectionContext.Provider>
}

export function useTrezoa(): TrezoaProviderState {
  return useContext(ConnectionContext)
}

export function useConnection(): Connection {
  return useTrezoa().connection
}
