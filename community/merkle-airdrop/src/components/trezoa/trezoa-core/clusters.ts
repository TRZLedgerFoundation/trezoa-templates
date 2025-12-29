export type ClusterOption = Readonly<{
  id: string
  label: string
  endpoint: string
  websocket?: string
}>

export const CLUSTERS: ClusterOption[] = [
  {
    id: 'devnet',
    label: 'Devnet',
    endpoint: 'https://api.devnet.trezoa.com',
    websocket: 'wss://api.devnet.trezoa.com',
  },
  {
    id: 'testnet',
    label: 'Testnet',
    endpoint: 'https://api.testnet.trezoa.com',
    websocket: 'wss://api.testnet.trezoa.com',
  },
  {
    id: 'mainnet-beta',
    label: 'Mainnet Beta',
    endpoint: 'https://api.mainnet-beta.trezoa.com',
    websocket: 'wss://api.mainnet-beta.trezoa.com',
  },
]

export function resolveCluster(endpoint: string | undefined): ClusterOption & { status?: string } {
  if (!endpoint) {
    return {
      id: 'custom',
      label: 'Custom',
      endpoint: '',
    }
  }
  const found = CLUSTERS.find((cluster) => cluster.endpoint === endpoint)
  if (found) return found
  return {
    id: 'custom',
    label: 'Custom',
    endpoint,
  }
}
