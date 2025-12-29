import { TrezoaCluster } from '@wallet-ui/react'
import {
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  registerMwa,
} from '@trezoa-mobile/wallet-standard-mobile'

export function trezoaMobileWalletAdapter({
  appIdentity = { name: 'Wallet UI' },
  clusters,
}: {
  appIdentity?: { uri?: string; icon?: string; name?: string }
  clusters: TrezoaCluster[]
}) {
  if (typeof window === 'undefined') {
    return
  }
  if (!window.isSecureContext) {
    console.warn(`Trezoa Mobile Wallet Adapter not loaded: https connection required`)
    return
  }
  const chains = clusters.map((c) => c.id)
  if (!chains.length) {
    console.warn(`Trezoa Mobile Wallet Adapter not loaded: no clusters provided`)
    return
  }
  registerMwa({
    appIdentity,
    authorizationCache: createDefaultAuthorizationCache(),
    chains,
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  })
  console.log(`Loaded Trezoa Mobile Wallet Adapter`)
}
