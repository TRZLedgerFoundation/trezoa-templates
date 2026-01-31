import { COUNTER_PROGRAM_ADDRESS } from '@trezoa/trezoaanchor'
import { useTrezoa } from '@/components/trezoa/use-trezoa'
import { useQuery } from '@tanstack/react-query'
import { useClusterVersion } from '@/features/cluster/data-access/use-cluster-version'

export function useCounterProgram() {
  const { client, cluster } = useTrezoa()
  const query = useClusterVersion()

  return useQuery({
    retry: false,
    queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
    queryFn: () => client.rpc.getAccountInfo(COUNTER_PROGRAM_ADDRESS).send(),
  })
}
