import { PublicKey, TransactionSignature } from '@trezoa/web3.js'
import { useConnection } from '@/components/trezoa/trezoa-provider'
import { useMutation } from '@tanstack/react-query'
import { useWalletUi } from '@/components/trezoa/use-wallet-ui'
import { createTransaction } from '@/components/trezoa/create-transaction'
import { useGetBalanceInvalidate } from './use-get-balance'

export function useTransferSol({ address }: { address: PublicKey }) {
  const connection = useConnection()
  const { signAndSendTransaction } = useWalletUi()
  const invalidateBalance = useGetBalanceInvalidate({ address })

  return useMutation({
    mutationKey: ['transfer-trz', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      let signature: TransactionSignature = ''
      try {
        const { transaction, latestBlockhash, minContextSlot } = await createTransaction({
          publicKey: address,
          destination: input.destination,
          amount: input.amount,
          connection,
        })

        // Send transaction and await for signature
        signature = await signAndSendTransaction(transaction, minContextSlot)

        // Send transaction and await for signature
        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

        console.log(signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`, signature)

        return
      }
    },
    onSuccess: async (signature) => {
      console.log(signature)
      await invalidateBalance()
    },
    onError: (error) => {
      console.error(`Transaction failed! ${error}`)
    },
  })
}
