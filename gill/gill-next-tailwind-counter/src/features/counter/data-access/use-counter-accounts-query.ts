import { useTrezoa } from '@/components/trezoa/use-trezoa'
import { useQuery } from '@tanstack/react-query'
import { getCounterProgramAccounts } from '@trezoa/trezoaanchor'
import { useCounterAccountsQueryKey } from './use-counter-accounts-query-key'

export function useCounterAccountsQuery() {
  const { client } = useTrezoa()

  return useQuery({
    queryKey: useCounterAccountsQueryKey(),
    queryFn: async () => await getCounterProgramAccounts(client.rpc),
  })
}
