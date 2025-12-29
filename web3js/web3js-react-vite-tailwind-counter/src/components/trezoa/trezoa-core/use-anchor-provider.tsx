import { TrezoaAnchorWallet, useConnection, useWallet } from '@trezoa/wallet-adapter-react'
import { TrezoaAnchorProvider } from '@trezoa-xyz/trezoaanchor'

export function useTrezoaAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return new TrezoaAnchorProvider(connection, wallet as TrezoaAnchorWallet, { commitment: 'confirmed' })
}
