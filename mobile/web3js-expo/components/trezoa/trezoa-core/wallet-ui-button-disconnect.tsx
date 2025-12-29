import { useWalletUi } from '@/components/trezoa/use-wallet-ui'
import { BaseButton } from '@/components/trezoa/base-button'
import React from 'react'

export function WalletUiButtonDisconnect({ label = 'Disconnect' }: { label?: string }) {
  const { disconnect } = useWalletUi()

  return <BaseButton label={label} onPress={() => disconnect()} />
}
