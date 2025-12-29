'use client'

import { WalletError } from '@trezoa/wallet-adapter-base'
import {
  TrezoaAnchorWallet,
  ConnectionProvider,
  useConnection,
  useWallet,
  WalletProvider,
} from '@trezoa/wallet-adapter-react'
import { WalletModalProvider } from '@trezoa/wallet-adapter-react-ui'
import dynamic from 'next/dynamic'
import { ReactNode, useCallback, useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import '@trezoa/wallet-adapter-react-ui/styles.css'
import { TrezoaAnchorProvider } from '@trezoa-xyz/trezoaanchor'

export const WalletButton = dynamic(async () => (await import('@trezoa/wallet-adapter-react-ui')).WalletMultiButton, {
  ssr: false,
})

export function TrezoaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const endpoint = useMemo(() => cluster.endpoint, [cluster])
  const onError = useCallback((error: WalletError) => {
    console.error(error)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export function useTrezoaAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return new TrezoaAnchorProvider(connection, wallet as TrezoaAnchorWallet, { commitment: 'confirmed' })
}
