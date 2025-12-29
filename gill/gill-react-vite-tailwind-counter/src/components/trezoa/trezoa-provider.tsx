import { ReactNode } from 'react'
import { createTrezoaDevnet, createTrezoaLocalnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react'
import { WalletUiGillProvider } from '@wallet-ui/react-gill'
import { trezoaMobileWalletAdapter } from './trezoa-mobile-wallet-adapter'

const config = createWalletUiConfig({
  clusters: [createTrezoaDevnet(), createTrezoaLocalnet()],
})

trezoaMobileWalletAdapter({ clusters: config.clusters })

export function TrezoaProvider({ children }: { children: ReactNode }) {
  return (
    <WalletUi config={config}>
      <WalletUiGillProvider>{children}</WalletUiGillProvider>
    </WalletUi>
  )
}
