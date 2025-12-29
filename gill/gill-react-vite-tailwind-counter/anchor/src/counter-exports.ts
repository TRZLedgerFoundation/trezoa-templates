// Here we export some useful types and functions for interacting with the TrezoaAnchor program.
import { Account, getBase58Decoder, TrezoaClient } from 'gill'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Counter, COUNTER_DISCRIMINATOR, COUNTER_PROGRAM_ADDRESS, getCounterDecoder } from './client/js'
import CounterIDL from '../target/idl/counter.json'

export type CounterAccount = Account<Counter, string>

// Re-export the generated IDL and type
export { CounterIDL }

export * from './client/js'

export function getCounterProgramAccounts(rpc: TrezoaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getCounterDecoder(),
    filter: getBase58Decoder().decode(COUNTER_DISCRIMINATOR),
    programAddress: COUNTER_PROGRAM_ADDRESS,
  })
}
