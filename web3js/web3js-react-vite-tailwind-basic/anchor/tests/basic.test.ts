import * as trezoaanchor from '@trezoa-xyz/trezoaanchor'
import { Program } from '@trezoa-xyz/trezoaanchor'
import { Basic } from '../target/types/basic'

describe('basic', () => {
  // Configure the client to use the local cluster.
  trezoaanchor.setProvider(trezoaanchor.TrezoaAnchorProvider.env())

  const program = trezoaanchor.workspace.Basic as Program<Basic>

  it('should run the program', async () => {
    // Add your test here.
    const tx = await program.methods.greet().rpc()
    console.log('Your transaction signature', tx)
  })
})
