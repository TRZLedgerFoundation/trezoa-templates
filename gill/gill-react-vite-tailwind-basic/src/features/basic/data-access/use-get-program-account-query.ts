import { useTrezoa } from '@/components/trezoa/use-trezoa'
import { useQuery } from '@tanstack/react-query'
import { BASIC_PROGRAM_ADDRESS } from '@trezoa/trezoaanchor'

export function useGetProgramAccountQuery() {
  const { client, cluster } = useTrezoa()

  return useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => client.rpc.getAccountInfo(BASIC_PROGRAM_ADDRESS).send(),
  })
}
