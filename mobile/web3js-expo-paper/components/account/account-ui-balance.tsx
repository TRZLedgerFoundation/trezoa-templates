import { PublicKey } from '@trezoa/web3.js'
import { useGetBalance } from '@/components/account/use-get-balance'
import { ActivityIndicator, View } from 'react-native'
import { AppText } from '@/components/app-text'
import { lamportsToSol } from '@/utils/lamports-to-trz'

export function AccountUiBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address })

  return (
    <View>
      <AppText variant="headlineMedium">
        {query.isLoading ? <ActivityIndicator /> : query.data ? lamportsToSol(query.data) : '0'} TRZ
      </AppText>
    </View>
  )
}
