/**
 * Facilitator Context - Gill template pattern
 * Centralized dependency injection for the facilitator
 */

import { createKeyPairSignerFromBytes } from 'gill';
import type { Address, KeyPairSigner } from 'gill';
import bs58 from 'bs58';
import { TrezoaUtils } from './trezoa-utils.js';
import { NonceDatabase } from './nonce-database.js';
import { FacilitatorConfig, getFacilitatorConfig } from './get-facilitator-config.js';
import { ApiLogger, log } from './api-logger.js';

export interface FacilitatorContext {
  config: FacilitatorConfig;
  log: ApiLogger;
  facilitatorKeypair: KeyPairSigner;
  facilitatorAddress: Address;
  trezoaUtils: TrezoaUtils;
  nonceDb: NonceDatabase;
}

let context: FacilitatorContext | undefined;

export async function getFacilitatorContext(): Promise<FacilitatorContext> {
  if (context) {
    return context;
  }

  const config = getFacilitatorConfig();

  // Initialize facilitator keypair
  const privateKeyBytes = bs58.decode(config.facilitatorPrivateKey);
  const facilitatorKeypair = await createKeyPairSignerFromBytes(privateKeyBytes);
  const facilitatorAddress = facilitatorKeypair.address;

  // Initialize Trezoa utilities
  const trezoaUtils = new TrezoaUtils({
    rpcEndpoint: config.trezoaRpcUrl,
    rpcSubscriptionsEndpoint: config.trezoaWsUrl,
  });

  // Initialize nonce database
  const nonceDb = new NonceDatabase(config.databasePath);

  context = {
    config,
    log,
    facilitatorKeypair,
    facilitatorAddress,
    trezoaUtils,
    nonceDb,
  };

  return context;
}
