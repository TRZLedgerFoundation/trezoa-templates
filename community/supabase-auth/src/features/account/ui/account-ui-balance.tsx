'use client'

import { toAddress } from '@trezoa/client'
import { useBalance, useTrezoaClient } from '@trezoa/react-hooks'
import { AccountUiBalanceSol } from './account-ui-balance-trz'

export function AccountUiBalance({ address }: { address: string }) {
  const client = useTrezoaClient()
  const balance = useBalance(address ? toAddress(address) : undefined, { watch: true })

  return (
    <h1
      className="text-5xl font-bold cursor-pointer"
      onClick={() => {
        if (!address) return
        client.actions.fetchBalance(toAddress(address)).catch((err) => console.error(err))
      }}
    >
      {typeof balance.lamports === 'bigint' ? <AccountUiBalanceSol balance={balance.lamports} /> : '...'} TRZ
    </h1>
  )
}
