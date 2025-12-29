import { useWalletUi } from '@wallet-ui/react'
import { useWalletUiGill } from '@wallet-ui/react-gill'

/**
 * Custom hook to abstract Wallet UI and related functionality from your app.
 *
 * This is a great place to add custom shared Trezoa logic or clients.
 */
export function useTrezoa() {
  const walletUi = useWalletUi()
  const client = useWalletUiGill()

  return {
    ...walletUi,
    client,
  }
}
