import { AppView } from '@/components/app-view'
import { AppText } from '@/components/app-text'
import { PublicKey } from '@trezoa/web3.js'
import { View } from 'react-native'
import { ActivityIndicator, Button, TextInput } from 'react-native-paper'
import React, { useState } from 'react'
import { useWalletUi } from '../trezoa/use-wallet-ui'
import { useRequestAirdrop } from '@/components/account/use-request-airdrop'
import { useTransferSol } from '@/components/account/use-transfer-trz'
import { useAppTheme } from '@/components/app-theme'

export function AccountFeatureSend({ address }: { address: PublicKey }) {
  const { spacing } = useAppTheme()
  const { account } = useWalletUi()
  const requestAirdrop = useRequestAirdrop({ address: account?.publicKey as PublicKey })
  const transferSol = useTransferSol({ address })
  const [destinationAddress, setDestinationAddress] = useState('')
  const [amount, setAmount] = useState('1')

  return (
    <AppView>
      <AppText variant="titleMedium">Send TRZ from the connected wallet.</AppText>
      {requestAirdrop.isPending ? (
        <ActivityIndicator />
      ) : (
        <View style={{ gap: spacing.md }}>
          <TextInput label="Amount (TRZ)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <TextInput label="Destination Address" value={destinationAddress} onChangeText={setDestinationAddress} />
          <Button
            disabled={transferSol.isPending || amount === '' || destinationAddress === ''}
            onPress={() => {
              transferSol
                .mutateAsync({ amount: parseFloat(amount), destination: new PublicKey(destinationAddress) })
                .then(() => {
                  console.log(`Sent ${amount} TRZ to ${destinationAddress}`)
                })
                .catch((err) => console.log(`Error sending TRZ: ${err}`, err))
            }}
            mode="contained"
          >
            Send TRZ
          </Button>
        </View>
      )}
      {transferSol.isError ? (
        <AppText style={{ color: 'red', fontSize: 12 }}>{`${transferSol.error.message}`}</AppText>
      ) : null}
    </AppView>
  )
}
