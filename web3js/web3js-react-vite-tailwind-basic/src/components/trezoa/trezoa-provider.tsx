import { WalletError } from '@trezoa/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@trezoa/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@trezoa/wallet-adapter-react-ui'
import React, { useCallback, useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import '@trezoa/wallet-adapter-react-ui/styles.css'

export { WalletMultiButton as WalletButton }

export function TrezoaProvider({ children }: { children: React.ReactNode }) {
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
