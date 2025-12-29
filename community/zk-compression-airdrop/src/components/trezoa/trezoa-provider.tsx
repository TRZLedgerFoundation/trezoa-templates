'use client'

import { ReactNode } from 'react'
import { TrezoaProvider as BaseTrezoaProvider } from '@trezoa/react-hooks'
import { autoDiscover, createClient } from '@trezoa/client'

const client = createClient({
  endpoint: 'https://api.devnet.trezoa.com',
  walletConnectors: autoDiscover(),
})

export function TrezoaProvider({ children }: { children: ReactNode }) {
  return <BaseTrezoaProvider client={client}>{children}</BaseTrezoaProvider>
}
