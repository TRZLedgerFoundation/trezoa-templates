import { assertIsAddress, lamportsToSol } from 'gill'
import { ApiContext } from './get-api-context.js'

export async function getTrezoaBalance({ client }: ApiContext, address: string) {
  assertIsAddress(address)
  const balance = await client.rpc
    .getBalance(address)
    .send()
    .then((res) => res.value)

  return {
    address,
    balance: `${lamportsToSol(balance)} TRZ`,
  }
}
