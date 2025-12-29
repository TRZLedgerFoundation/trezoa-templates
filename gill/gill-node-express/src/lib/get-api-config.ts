import 'dotenv/config'
import { z } from 'zod'

const ApiConfigSchema = z.object({
  corsOrigins: z.array(z.string()),
  port: z.coerce.number().int().positive(),
  trezoaRpcEndpoint: z.string(),
  trezoaSignerPath: z.string(),
})

export type ApiConfig = z.infer<typeof ApiConfigSchema>

let config: ApiConfig | undefined

export function getApiConfig(): ApiConfig {
  if (config) {
    return config
  }
  config = ApiConfigSchema.parse({
    corsOrigins: process.env.CORS_ORIGINS?.split(',') ?? [],
    trezoaRpcEndpoint: process.env.TREZOA_RPC_ENDPOINT ?? 'devnet',
    trezoaSignerPath: process.env.TREZOA_SIGNER_PATH ?? '~/.config/trezoa/id.json',
    port: process.env.PORT ?? 3000,
  })
  return config
}
