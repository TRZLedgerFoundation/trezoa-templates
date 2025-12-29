/**
 * Server Configuration - Gill template pattern
 * Uses Zod for type-safe configuration validation
 */

import 'dotenv/config';
import { z } from 'zod';

const ServerConfigSchema = z.object({
  port: z.coerce.number().int().positive(),
  facilitatorUrl: z.string().url(),
  merchantTrezoaAddress: z.string().optional(),
  facilitatorPublicKey: z.string().optional(),
  trezoaRpcUrl: z.string().url().optional(),
  trezoaNetwork: z.enum(['mainnet-beta', 'devnet', 'testnet', 'localnet']).optional(),
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;

let config: ServerConfig | undefined;

export function getServerConfig(): ServerConfig {
  if (config) {
    return config;
  }

  try {
    config = ServerConfigSchema.parse({
      port: process.env.SERVER_PORT ?? 3000,
      facilitatorUrl: process.env.FACILITATOR_URL ?? 'http://localhost:3001',
      merchantTrezoaAddress: process.env.MERCHANT_TREZOA_ADDRESS,
      facilitatorPublicKey: process.env.FACILITATOR_PUBLIC_KEY,
      trezoaRpcUrl: process.env.TREZOA_RPC_URL,
      trezoaNetwork: process.env.TREZOA_NETWORK ?? 'devnet',
    });

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Server configuration validation failed:');
      error.issues.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid server configuration. Please check your .env file.');
    }
    throw error;
  }
}
